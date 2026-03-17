from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "password",
            "password_confirm",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
        }

    # -----------------------------
    # FIELD-LEVEL NORMALIZATION
    # -----------------------------
    def validate_first_name(self, value):
            value = value.strip().title()
            if not value.isalpha():
                raise serializers.ValidationError("Name must contain only letters.")
            return value
        
    def validate_last_name(self, value):
            value = value.strip().title()
            if not value.isalpha():
                raise serializers.ValidationError("Name must contain only letters.")
            return value
        

    def validate_email(self, value):
        return value.strip().lower()

    # -----------------------------
    # OBJECT-LEVEL VALIDATION
    # -----------------------------
    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError({
                "password_confirm": ["Passwords do not match."]
            })
        return data

    # -----------------------------
    # CREATE USER
    # -----------------------------
    def create(self, validated_data):
        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        user = User.objects.create(
            username=validated_data["email"],  # email as username
            is_active=False,  # require verification
            **validated_data
        )

        user.set_password(password)
        user.save()

        return user