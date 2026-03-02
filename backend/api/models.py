from django.db import models
from django.contrib.auth.models import User


class TestResult(models.Model):
    MODE_CHOICES = [
        ("test", "Pi Test"),
        ("practice", "Pi Practice"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="test_results")
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default="test")
    digits_entered = models.IntegerField()
    correct_digits = models.IntegerField()
    score_percent = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} — {self.mode} — {self.correct_digits}/{self.digits_entered} ({self.score_percent}%)"
