from rest_framework import permissions

class IsAmministratore(permissions.BasePermission):
    """
    Consente l'accesso solo all'Amministratore.
    """
    def has_permission(self, request, view):
        user = request.user
        return user and user.is_authenticated and (getattr(user, 'role', '') == 'amministratore' or getattr(user, 'is_superuser', False))

class IsMagazziniere(permissions.BasePermission):
    """
    Consente l'accesso in scrittura e lettura a chiunque faccia parte
    del team di gestione magazzino:
    - Magazziniere
    - Amministratore
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
            
        role = getattr(user, 'role', '')
        return (
            role in ['magazziniere', 'amministratore'] or
            getattr(user, 'is_superuser', False)
        )
