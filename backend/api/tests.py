from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import TestResult
from .views import PI_DIGITS


class PiDigitsTests(APITestCase):
    def test_returns_digits_without_whitespace(self):
        response = self.client.get("/api/pi/digits/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        digits = response.data["digits"]
        self.assertTrue(digits.startswith("3.14159265358979"))
        self.assertFalse(any(ch.isspace() for ch in digits))


class CheckAnswerTests(APITestCase):
    url = "/api/pi/check/"

    def check(self, answer):
        response = self.client.post(self.url, {"input": answer}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data

    def test_all_correct(self):
        data = self.check("3.14159")

        self.assertEqual(data["digits_entered"], 7)
        self.assertEqual(data["correct_digits"], 7)
        self.assertEqual(data["score_percent"], 100.0)
        self.assertTrue(all(r["correct"] for r in data["results"]))

    def test_mistakes_are_marked_with_expected_digit(self):
        data = self.check("3.14259")

        self.assertEqual(data["correct_digits"], 6)
        self.assertEqual(data["score_percent"], round(6 / 7 * 100, 2))
        wrong = [r for r in data["results"] if not r["correct"]]
        self.assertEqual(wrong, [{"digit": "2", "correct": False, "expected": "1"}])

    def test_returns_next_ten_digits(self):
        data = self.check("3.14")

        self.assertEqual(data["next_digits"], PI_DIGITS[4:14])

    def test_empty_input(self):
        data = self.check("")

        self.assertEqual(data["digits_entered"], 0)
        self.assertEqual(data["correct_digits"], 0)
        self.assertEqual(data["score_percent"], 0.0)
        self.assertEqual(data["results"], [])

    def test_input_longer_than_known_digits(self):
        data = self.check(PI_DIGITS + "7")

        extra = data["results"][-1]
        self.assertEqual(extra, {"digit": "7", "correct": False, "expected": None})
        self.assertEqual(data["correct_digits"], len(PI_DIGITS))
        self.assertEqual(data["next_digits"], "")


class AuthTests(APITestCase):
    def register(self, **overrides):
        payload = {"username": "alice", "email": "alice@example.com", "password": "circle-3141"}
        payload.update(overrides)
        return self.client.post("/api/auth/register/", payload, format="json")

    def test_register_creates_user_without_returning_password(self):
        response = self.register()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("password", response.data)
        self.assertTrue(User.objects.get(username="alice").check_password("circle-3141"))

    def test_register_rejects_short_password(self):
        response = self.register(password="short")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username="alice").exists())

    def test_register_rejects_duplicate_username(self):
        self.register()
        response = self.register(email="other@example.com")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_then_fetch_current_user(self):
        self.register()
        login = self.client.post(
            "/api/auth/login/", {"username": "alice", "password": "circle-3141"}, format="json"
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.assertIn("refresh", login.data)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        response = self.client.get("/api/auth/user/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "alice")

    def test_login_with_wrong_password(self):
        self.register()
        response = self.client.post(
            "/api/auth/login/", {"username": "alice", "password": "wrong-password"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_current_user_requires_auth(self):
        response = self.client.get("/api/auth/user/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestResultTests(APITestCase):
    url = "/api/results/"

    def setUp(self):
        self.alice = User.objects.create_user("alice", password="circle-3141")
        self.bob = User.objects.create_user("bob", password="circle-3141")

    def test_requires_auth(self):
        self.assertEqual(self.client.get(self.url).status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.post(
            self.url,
            {"mode": "test", "digits_entered": 5, "correct_digits": 5, "score_percent": 100.0},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_save_result_for_logged_in_user(self):
        self.client.force_authenticate(self.alice)
        response = self.client.post(
            self.url,
            {"mode": "practice", "digits_entered": 50, "correct_digits": 48, "score_percent": 96.0},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        result = TestResult.objects.get()
        self.assertEqual(result.user, self.alice)
        self.assertEqual(result.mode, "practice")

    def test_rejects_unknown_mode(self):
        self.client.force_authenticate(self.alice)
        response = self.client.post(
            self.url,
            {"mode": "cheat", "digits_entered": 5, "correct_digits": 5, "score_percent": 100.0},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_lists_only_own_results_newest_first(self):
        first = TestResult.objects.create(
            user=self.alice, mode="test", digits_entered=10, correct_digits=9, score_percent=90.0
        )
        second = TestResult.objects.create(
            user=self.alice, mode="test", digits_entered=20, correct_digits=20, score_percent=100.0
        )
        TestResult.objects.create(
            user=self.bob, mode="test", digits_entered=5, correct_digits=5, score_percent=100.0
        )

        self.client.force_authenticate(self.alice)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [r["id"] for r in response.data]
        self.assertEqual(ids, [second.id, first.id])
