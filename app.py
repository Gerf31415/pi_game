from flask import Flask, render_template, request

app = Flask(__name__)

with open('pi.txt', 'r') as file:
    pi_digits = ''.join(file.read().splitlines())  # Remove line breaks

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/pi-test', methods=['GET', 'POST'])
def pi_test():
    if request.method == 'POST':
        # Get data about user input
        user_input = request.form['pi_digits']
        digits_entered = len(user_input)

        # Calculate basic stats for user
        correct_digits = sum([pi_digits[i] == user_input[i] for i in range(digits_entered)])
        percentage_correct = round(((correct_digits / digits_entered) * 100 if digits_entered != 0 else 0), 2)

        # Store indices of incorrect digits
        incorrect_digits = [i for i in range(digits_entered) if pi_digits[i] != user_input[i]]

        # Prepare corrected pi
        corrected_pi = pi_digits[:digits_entered]

        # Prepare indices for user input
        user_input_indices = list(range(digits_entered))

        return render_template('pi_test.html', correct_digits=correct_digits, digits_entered=digits_entered,
                               percentage_correct=percentage_correct, corrected_pi=corrected_pi,
                               user_input=user_input, incorrect_digits=incorrect_digits,
                               user_input_indices=user_input_indices, pi_digits=pi_digits)
    return render_template('pi_test.html')

@app.route('/pi-practice', methods=['GET', 'POST'])
def pi_practice():
    if request.method == 'POST':
        # Get user's input
        start_digit = int(request.form['start-digit'])

        # Set pi to start at user selected value
        user_pi = pi_digits[start_digit:]

        # Get the 10 digits before the user_pi string
        if start_digit < 10:
            previous_digits = pi_digits[:start_digit]
        else:
            previous_digits = pi_digits[start_digit - 10:start_digit]

        return render_template('pi_practice.html', pi_digits=user_pi, previous_digits=previous_digits)

    return render_template('pi_practice.html', pi_digits=pi_digits, previous_digits="")

@app.route('/learn-pi', methods=['GET'])
def learn_pi():
    # Format the pi string with spaces every 5 digits and line breaks every 50
    formatted_pi = ''
    for i in range(len(pi_digits)):
        formatted_pi += pi_digits[i]
        if (i + 4) % 5 == 0:
            formatted_pi += ' '  # Add space after every 5 digits
        if (i + 4) % 50 == 0:
            formatted_pi += '\n'  # Add line break after every 50 digits

    pi_formatted = formatted_pi

    return render_template('learn_pi.html', pi_formatted=pi_formatted)
