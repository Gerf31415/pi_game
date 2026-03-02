from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView,
    CurrentUserView,
    PiDigitsView,
    CheckAnswerView,
    TestResultListCreateView,
)

urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/user/", CurrentUserView.as_view(), name="current_user"),

    # Pi
    path("pi/digits/", PiDigitsView.as_view(), name="pi_digits"),
    path("pi/check/", CheckAnswerView.as_view(), name="check_answer"),

    # Results
    path("results/", TestResultListCreateView.as_view(), name="test_results"),
]
