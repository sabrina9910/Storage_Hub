from .models import AuditLog

def create_audit_log(user, action_type, product, quantity=0, notes=''):
    """
    Create an audit log entry
    
    Args:
        user: User object
        action_type: One of ACTION_TYPES choices
        product: Product object
        quantity: Integer quantity (default 0)
        notes: Optional notes string
    """
    return AuditLog.objects.create(
        user=user,
        user_full_name=f"{user.first_name} {user.last_name}".strip() or user.email,
        user_email=user.email,
        user_role=getattr(user, 'role', 'unknown'),
        action_type=action_type,
        product=product,
        product_name=product.name,
        product_sku=product.sku,
        quantity=quantity,
        notes=notes
    )
