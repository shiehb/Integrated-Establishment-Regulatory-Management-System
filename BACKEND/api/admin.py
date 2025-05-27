from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('id_number', 'email', 'first_name', 'last_name', 'user_level', 'status', 'is_staff')
    list_filter = ('user_level', 'status', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('id_number', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'middle_name', 'email')}),
        ('Permissions', {'fields': ('user_level', 'status', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'id_number', 'email', 'first_name', 'last_name', 'middle_name',
                'password1', 'password2', 'user_level', 'status', 'is_staff', 'is_superuser'
            ),
        }),
    )
    readonly_fields = ('last_login', 'created_at', 'updated_at')
    search_fields = ('id_number', 'email', 'first_name', 'last_name')
    ordering = ('id_number',)

admin.site.register(CustomUser, CustomUserAdmin)
