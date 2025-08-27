
def format_response(data):
    """Format API response data"""
    return {
        'status': 'success',
        'data': data,
        'timestamp': '2024-01-01T00:00:00Z'
    }

class DataProcessor:
    def __init__(self, config):
        self.config = config

    def process(self, data):
        return format_response(data)
