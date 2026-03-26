from django.contrib.auth import login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework import status

from .serializer import RegisterSerializer


# ---------------------------------------------------------
# CSRF TOKEN VIEW
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_token_view(request):
    return Response({
        "csrfToken": get_token(request),
        "detail": "CSRF cookie set successfully"
    })


# ---------------------------------------------------------
# REGISTER VIEW (ADMIN ACTIVATES LATER)
# ---------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):

    email = request.data.get("email")

    existing_user = User.objects.filter(email=email).first()

    if existing_user:
        return Response(
            {"message": "If an account exists, it will be reviewed by admin."},
            status=status.HTTP_200_OK
        )

    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save() #(is_active=False)  #inactive by default

        return Response(
            {"message": "Registration successful. Await activation."},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------
# LOGIN VIEW
# ---------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):

    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST
        )


    try:
        #user = User.objects.get(username=username)
        user = authenticate(request, username=username, password=password)

        if not user.is_active:
            return Response(
                {"error": "Your account is not activated. Keep checking your email for activation."},
                status=status.HTTP_403_FORBIDDEN
            )
        if user is None:
            return Response({"error": "Invalid credentials"}, status=401)
    except User.DoesNotExist:
        return Response(
            {"error": "Incorrect username or password."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not check_password(password, user.password):
        return Response(
            {"error": "Incorrect username or password."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    

    login(request, user)

    return Response({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name
        }
    })


# ---------------------------------------------------------
# LOGOUT VIEW
# ---------------------------------------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"message": "Logout successful"})


# ---------------------------------------------------------
# SESSION VIEW
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def session_view(request):

    if request.user.is_authenticated:
        return Response({
            "authenticated": True,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "is_active": request.user.is_active,
            }
        })

    return Response({"authenticated": False})