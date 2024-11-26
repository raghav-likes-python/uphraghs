from flask import Flask, request, jsonify
import json

app = Flask(__name__)

top_scores = []

def update_top_scores(name, score):

    top_scores.append({'name': name, 'score': score})

    top_scores.sort(key=lambda x: x['score'], reverse=True)

    if len(top_scores) > 5:
        top_scores.pop()

@app.route('/submit_score', methods=['POST'])
def submit_score():
    data = request.get_json()
    name = data.get('name')
    score = data.get('score')

    update_top_scores(name, score)
    
    return jsonify({'message': 'Score submitted successfully!'})

@app.route('/get_top_scores', methods=['GET'])
def get_top_scores():
    return jsonify(top_scores)

if __name__ == '__main__':
    app.run(debug=True)

    # this is useless now
    # replaced by localstorage (serverless)