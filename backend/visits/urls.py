from django.urls import path
from .views import RecordVisitView

urlpatterns = [
    path('visits/', RecordVisitView.as_view(), name='record-visit'),
]
