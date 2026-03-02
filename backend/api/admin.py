from django.contrib import admin
from .models import TestResult

@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ("user", "mode", "correct_digits", "digits_entered", "score_percent", "created_at")
    list_filter = ("mode", "user")
    ordering = ("-created_at",)
