from django.shortcuts import render
import os
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from gtts import gTTS

@csrf_exempt
def text_to_speech(request):
    if request.method == 'POST':
        text = request.POST.get('text', '')

        if not text:
            return JsonResponse({"error": "No text provided"}, status=400)

        tts = gTTS(text=text, lang='en')
        file_path = "media/audio.mp3"
        tts.save(file_path)

        return FileResponse(open(file_path, 'rb'), content_type='audio/mpeg')

    return JsonResponse({"error": "Invalid request"}, status=400)

