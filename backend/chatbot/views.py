from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
from prodotti.models import Product, ProductLot
from django.db.models import Sum, Q

try:
    import google.genai as genai
except ImportError:
    from google import genai

import json

class ChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message', '')
        print(f"DEBUG: ChatView received message: '{user_message}'")
        if not user_message:
            return Response({"error": "Messaggio vuoto"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Gather Inventory Context
        products = Product.objects.filter(is_active=True).annotate(
            total_stock=Sum('lots__current_quantity', filter=Q(lots__is_active=True))
        )
        
        from django.utils import timezone
        now = timezone.now().date()
        
        low_stock_list = [p.name for p in products if (p.total_stock or 0) < p.min_stock_threshold]
        quarantine_count = ProductLot.objects.filter(is_active=True, current_quantity__gt=0, expiration_date__lt=now).count()
        
        inventory_context = f"""
        Stato attuale del magazzino:
        - Prodotti totali attivi: {products.count()}
        - Prodotti sotto scorta: {len(low_stock_list)} ({', '.join(low_stock_list[:5])}{'...' if len(low_stock_list) > 5 else ''})
        - Lotti scaduti (quarantena): {quarantine_count}
        """

        # 2. Check for Gemini Key
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        
        if api_key:
            try:
                genai.configure(api_key=api_key)
                model = genai.TextGenerationModel.from_pretrained("gemini-flash-latest")
                prompt = (
                    f"Sei l'assistente virtuale di StorageHub, un sistema di gestione magazzino premium. "
                    f"Rispondi in modo professionale ed efficace. Usa questo contesto per rispondere se pertinente:\n{inventory_context}\n"
                    f"Utente: {user_message}\nRisposta:"
                )

                response = model.generate(prompt=prompt)
                ai_reply = response.text
                return Response({"reply": ai_reply})
            except Exception as e:
                return Response({
                    "reply": f"Scusa, ho riscontrato un errore nel connettermi al mio cervello Gemini. {inventory_context} \n\n(Dettaglio tecnico: {str(e)})"
                })
        else:
            # Fallback Smart Response
            return Response({
                "reply": f"Ciao! Sono l'assistente di StorageHub. Al momento la mia intelligenza avanzata (Gemini) non è configurata con una API Key valida nel file .env, ma posso comunque dirti che: \n\n{inventory_context}\n\nChiedi all'amministratore di inserire la chiave GEMINI_API_KEY per sbloccare tutte le mie potenzialità!"
            })
