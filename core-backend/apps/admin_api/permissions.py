"""
Custom permissions for admin API endpoints.
Only staff/superuser accounts can access admin APIs.
"""
from rest_framework.permissions import BasePermission


class IsAdminOrStaff(BasePermission):
    """
    Allows access only to admin (is_staff or is_superuser) users.
    Used for all admin panel API endpoints.
    """
    message = 'Admin access required. You must be a staff member to perform this action.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_staff or request.user.is_superuser
