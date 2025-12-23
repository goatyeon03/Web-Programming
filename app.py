from flask import Flask, render_template, jsonify, request
import urllib.request
import json
from dotenv import load_dotenv
import os
from flask_cors import CORS
from datetime import datetime
import traceback



#import time

# 환경 변수 로드
load_dotenv()

app = Flask(__name__)
#CORS(app, origins=["http://localhost:5500", "http://127.0.0.1:5500", "https://single-frame-406609.el.r.appspot.com"])
CORS(app, origins=["https://single-frame-406609.el.r.appspot.com"])

# 기본 경로 (index.html 렌더링)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cafe')
def cafe():
    return render_template('cafe.html')

@app.route('/restaurant')
def restaurant():
    return render_template('restaurant.html')

@app.route('/attraction')
def attraction():
    return render_template('attraction.html')

# 네이버 API 클라이언트 설정
NAVER_CLIENT_ID = os.getenv('NAVER_CLIENT_ID')
NAVER_CLIENT_SECRET = os.getenv('NAVER_CLIENT_SECRET')

# 네이버 API를 호출하는 함수
def getRequestUrl(url):
    req = urllib.request.Request(url)
    req.add_header("X-Naver-Client-ID", NAVER_CLIENT_ID)
    req.add_header("X-Naver-Client-Secret", NAVER_CLIENT_SECRET)

    try:
        response = urllib.request.urlopen(req)
        if response.getcode() == 200:
            return response.read().decode('utf-8')
        else:
            print(f"Error: {response.getcode()} - {url}")
            return None
    except Exception as e:
        print(f"Exception: {str(e)} - {url}")
        return None

# 네이버 API 검색 함수
def getNaverSearch(node, query, start, display):
    base = "https://openapi.naver.com/v1/search"
    node = f"/{node}.json"
    parameters = f"?query={urllib.parse.quote(query)}&start={start}&display={display}"

    url = base + node + parameters

    # start_time = time.time()  # 시작 시간 기록
    response = getRequestUrl(url)
    # end_time = time.time()  # 종료 시간 기록

    # elapsed_time = end_time - start_time  # 소요 시간 계산
    # print(f"API 호출 소요 시간: {elapsed_time:.3f}초")  # 소요 시간 출력

    if response:
        return json.loads(response)
    else:
        return None

# 클라이언트에서 호출하는 API 요청 처리
@app.route('/fetchBlogLinks', methods=['GET'])
def fetch_blog_links():
    
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    
    # start_time = time.time()  # 시작 시간 기록

    try:
        # 네이버 API에서 블로그 검색
        result = getNaverSearch('blog', query, 1, 25)
        if result is None:
            return jsonify({"error": "Failed to fetch data from Naver"}), 500

        # 'items' 키 존재 여부 확인
        if 'items' in result:
            items = result['items']
            # 작성일(postdate) 기준으로 내림차순 정렬
            try:
                # 'postdate'가 'YYYYMMDD' 형식일 경우 이를 datetime으로 변환
                items.sort(key=lambda x: datetime.strptime(x['postdate'], '%Y%m%d'), reverse=True)
            except KeyError:
                return jsonify({"error": "Some items are missing postdate"}), 500
            except ValueError as e:
                print(f"Date format error: {e}")
                return jsonify({"error": "Invalid date format in some items"}), 500
            
            # end_time = time.time()  # 종료 시간 기록
            # elapsed_time = end_time - start_time  # 소요 시간 계산
            # print(f"전체 처리 소요 시간: {elapsed_time:.3f}초")  # 소요 시간 출력

            return jsonify(items)
        else:
            return jsonify({"error": "No items found in Naver response"}), 500
    except Exception as e:
        print(f"Error in fetch_blog_links: {e}")
        print(traceback.format_exc())  # 예외의 자세한 스택 추적 정보 출력
        return jsonify({"error": "Internal server error"}), 500

'''
if __name__ == '__main__':
    app.run(debug=True, port=5500)
'''

if __name__ == '__main__':
    # Google Cloud 환경에 맞게 호스트와 포트를 설정
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))

