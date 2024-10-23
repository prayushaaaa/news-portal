from googletrans import Translator

translator = Translator()

def translate_to_english(text):
    try:
        result = translator.translate(text, dest='en').text
        return result
    except Exception as e:
        print(f"Translation failed: {e}")
        return text