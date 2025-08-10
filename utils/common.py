import random, string, uuid, time

def generate_user_agent():
    return ('Mozilla/5.0 (Linux; Android 10; K) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/137.0.0.0 Mobile Safari/537.36')

def random_string(k=20):
    return ''.join(random.choices(string.ascii_lowercase, k=k))

def random_digits(k=4):
    return ''.join(random.choices(string.digits, k=k))

def random_email():
    return f"{random_string()}{random_digits()}@yahoo.com"

def random_username():
    return f"{random_string()}{random_digits()}"

def random_code(length=32):
    pool = string.ascii_letters + string.digits
    return ''.join(random.choice(pool) for _ in range(length))