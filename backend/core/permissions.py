from rest_framework import permissions

class IsManagerOrSuperuser(permissions.BasePermission):
    """
    Consente l'accesso solo al Manager (is_admin=True) 
    o al Programmatore (is_superuser=True).
    """
    def has_permission(self, request, view):
        user = request.user
        return user and user.is_authenticated and (getattr(user, 'is_admin', False) or getattr(user, 'is_superuser', False))

class IsInventoryWorker(permissions.BasePermission):
    """
    Consente l'accesso in scrittura e lettura a chiunque faccia parte
    del team di gestione magazzino:
    - Magazziniere (is_warehouse_worker=True)
    - Manager (is_admin=True)
    - Programmatore (is_superuser=True)
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
            
        return (
            getattr(user, 'is_warehouse_worker', False) or
            getattr(user, 'is_admin', False) or
            getattr(user, 'is_superuser', False)
        )
