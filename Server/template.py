import json

class TemplateHandler():
    def __init__(self, template_str):
        self.template_str = template_str
        self.template_json = self.str_to_json(template_str)

    def str_to_json(self, template_str):
        try:    
            self.template_json = json.loads(template_str)
        except Exception as e:
            print("Error creating json", e)
            return None
        return self.template_json

    def verify_template(self):
        template_json = self.str_to_json(self.template_str)
        if not template_json:
            return False
        return True

    def get_urls(self):
        print(self.get_template_json())
        return self.get_template_json().get('urls_regex')

    def get_template_json(self):
        return self.template_json

