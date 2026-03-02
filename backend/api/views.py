from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import TestResult
from .serializers import RegisterSerializer, UserSerializer, TestResultSerializer


def _load_pi_digits():
    with open(settings.PI_FILE_PATH, "r") as f:
        raw = f.read()
    return "".join(raw.split())  # strip all whitespace


PI_DIGITS = _load_pi_digits()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class CurrentUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class PiDigitsView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        """Return pi digits (without the leading '3.')."""
        return Response({"digits": PI_DIGITS})


class CheckAnswerView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        user_input = request.data.get("input", "")
        # Keep all characters (including the '3.') — match original app behaviour
        user_digits = user_input

        results = []
        correct_count = 0
        for i, ch in enumerate(user_digits):
            if i >= len(PI_DIGITS):
                results.append({"digit": ch, "correct": False, "expected": None})
            else:
                is_correct = ch == PI_DIGITS[i]
                if is_correct:
                    correct_count += 1
                results.append({"digit": ch, "correct": is_correct, "expected": PI_DIGITS[i]})

        digits_entered = len(user_digits)
        score_percent = round((correct_count / digits_entered * 100), 2) if digits_entered > 0 else 0.0

        # Next 10 digits for reference
        end_idx = min(len(PI_DIGITS), digits_entered + 10)
        next_digits = PI_DIGITS[digits_entered:end_idx]

        return Response({
            "results": results,
            "correct_digits": correct_count,
            "digits_entered": digits_entered,
            "score_percent": score_percent,
            "next_digits": next_digits,
        })


class TestResultListCreateView(generics.ListCreateAPIView):
    serializer_class = TestResultSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return TestResult.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
