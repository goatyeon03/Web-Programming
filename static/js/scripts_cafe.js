let map;
let markers = [];
let currentPlace = null;  // 현재 선택된 장소를 저장할 변수
let tutorialStepIndex = 0; // 튜토리얼 단계 인덱스


// 튜토리얼 단계 정의
const tutorialSteps = [
    {
        message: "1. 검색창에 원하는 지역을 입력한 후 검색 버튼을 눌러보세요!",
        target: document.getElementById("search-input"),
        video: "/static/video/tutorial_1.mp4", 
    },
    {
        message: "2. 구글맵에서 원하는 장소 마커를 선택하세요!",
        target: document.getElementById("map"),
        video: "/static/video/tutorial_2.mp4",
    },
    {
        message: "3. 필터링을 원하신다면 옵션을 선택하고 필터 버튼을 눌러보세요!",
        target: document.getElementById("filter-container"),
        video: "/static/video/tutorial_3.mp4",
    },
    {
        message: "4. 검색 결과 링크를 클릭해 자세한 내용을 확인하세요!",
        target: document.getElementById("result-links"),
        video: "/static/video/tutorial_4.mp4",
    },
];


// 로컬스토리지에 튜토리얼 진행 상태 저장
function saveTutorialState() {
    if (tutorialStepIndex >= tutorialSteps.length) {
        localStorage.setItem('tutorialComplete', 'true');
        console.log("튜토리얼 완료 상태가 로컬스토리지에 저장되었습니다.");
    }
}


// 로컬스토리지에서 튜토리얼 상태 불러오기
function loadTutorialState() {
    const tutorialComplete = localStorage.getItem('tutorialComplete');
    if (tutorialComplete) {
        tutorialStepIndex = tutorialSteps.length;  // 이미 튜토리얼이 완료되었다면, 튜토리얼 단계가 끝났음을 설정
        console.log("튜토리얼이 이미 완료되었습니다.");
    } else {
        // 첫 시작 시 튜토리얼 단계 보여주기
        const step = tutorialSteps[tutorialStepIndex];
        showTutorialPopup(step.message);
        step.target.scrollIntoView();
    }
}


// 튜토리얼 진행
let autoTutorialTimeout; // 자동 이동 타이머를 저장할 변수

function startTutorial() {
    if (tutorialStepIndex < tutorialSteps.length) {
        const step = tutorialSteps[tutorialStepIndex];
        showTutorialPopup(step.message, step.target, step.video);

        // 기존 타이머 취소
        clearTimeout(autoTutorialTimeout);

        // 일정 시간 후 자동으로 다음 단계로 이동
        autoTutorialTimeout = setTimeout(() => {
            hideTutorialPopup();
            tutorialStepIndex++;
            startTutorial(); // 다음 단계 호출
        }, 10000); // 15초 동안 메시지 표시
    } else {
        console.log("튜토리얼이 완료되었습니다!");
        saveTutorialState(); // 튜토리얼 완료 상태 저장
    }
}

//////
// 로딩 오버레이 표시
function showLoadingOverlay() {
    const overlay = document.getElementById("loading-overlay");
    overlay.style.display = "flex"; // 플렉스 레이아웃으로 중앙 정렬
}

// 로딩 오버레이 숨기기
function hideLoadingOverlay() {
    const overlay = document.getElementById("loading-overlay");
    overlay.style.display = "none";
}




// 맵 초기화
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.631813, lng: 127.077406 }, // 서울과학기술대학교 위치
        zoom: 15,
    });

    // searchPlaces 함수는 버튼 클릭 시에만 호출하도록 수정
    document.getElementById("search-button").addEventListener("click", () => {
        const location = document.getElementById("search-input").value;
        if (location) {
            showLoadingOverlay(); // 로딩 오버레이 표시
            searchPlaces("카페", location).finally(() => hideLoadingOverlay());  // "카페" 카테고리로 검색
        }
        moveToNextTutorialStep();
    });

    document.getElementById("search-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const location = document.getElementById("search-input").value;
            if (location) {
                showLoadingOverlay(); // 로딩 오버레이 표시
                searchPlaces("카페", location).finally(() => hideLoadingOverlay()); // 로딩 완료 후 숨기기
            }
            moveToNextTutorialStep();
        }
    });

    // 튜토리얼 상태 불러오기
    loadTutorialState();
}



function addMarkerClickEvent(marker, place) {
    google.maps.event.addListener(marker, "click", () => {
        if (!currentPlace || currentPlace.place_id !== place.place_id) {
            currentPlace = place; // 클릭된 장소 저장
            //document.getElementById("loading-spinner").classList.remove("hidden"); // 로딩 표시
            showLoadingOverlay(); // 로딩 오버레이 표시

            // 장소 정보 표시 및 블로그 링크 가져오기
            showPlaceInfo(place);
            fetchBlogLinks(place.name)
                .then(() => console.log("블로그 링크 가져오기 완료"))
                .finally(() => hideLoadingOverlay());
        }

        // 필터 버튼 표시
        const filterContainer = document.getElementById("filter-container");
        if (filterContainer.style.display === "none" || filterContainer.style.display === "") {
            filterContainer.style.display = "block"; // 필터 버튼 보이기
        }

        // 마커 클릭 후 튜토리얼 진행
        if (tutorialStepIndex === 1) { // 현재 단계가 "마커 클릭" 단계일 때만 진행
            console.log("마커 클릭 후 튜토리얼 단계 진행."); // 디버깅 로그 추가
            moveToNextTutorialStep();
        } else {
            console.log(`현재 tutorialStepIndex: ${tutorialStepIndex}`); // 상태 확인 로그
        }
    });
}






function searchPlaces(category, location) {
    showLoadingOverlay(); // 로딩 오버레이 표시

    const service = new google.maps.places.PlacesService(map);

    service.textSearch(
        { query: `${location} ${category}`, location: map.getCenter(), radius: 1000 },
        (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                clearMarkers(); // 기존 마커 초기화

                results.forEach((place, index) => {
                    const marker = new google.maps.Marker({
                        position: place.geometry.location,
                        map,
                        title: place.name,
                    });
                    markers.push(marker);

                    // 마커 클릭 이벤트 추가
                    addMarkerClickEvent(marker, place);

                    // 검색된 첫 번째 장소로 지도 중심 이동
                    if (index === 0) {
                        map.setCenter(place.geometry.location);
                        map.setZoom(14); // 지도 줌 레벨 설정
                    }
                });

                console.log("검색 완료, 마커 생성 완료.");
            } else {
                console.error("검색 결과를 찾을 수 없습니다.");
                alert("검색 결과가 없습니다. 다른 지역이나 키워드를 입력해주세요.");
            }

            hideLoadingOverlay(); // 검색 후 로딩 오버레이 숨기기
        }
    );

    // 만약 검색에 시간이 오래 걸릴 경우를 대비해 일정 시간 후에 로딩 오버레이를 숨김
    setTimeout(() => {
        hideLoadingOverlay(); // 타임아웃 방지용 안전 장치
    }, 10000); // 10초 초과 시 강제로 숨김
}








// 마커 초기화
function clearMarkers() {
    markers.forEach((marker) => marker.setMap(null));
    markers = [];
}

// 장소 정보 표시
function getPlaceDetails(placeId, map) {
    const service = new google.maps.places.PlacesService(map);

    service.getDetails(
        {
            placeId: placeId,
            fields: [
                'name',
                'rating',
                'formatted_address',
                'formatted_phone_number',
                'website',
                'opening_hours'
            ], // 필요한 필드만 요청
        },
        (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                showPlaceInfo(place);
            } else {
                console.error("Place Details request failed due to:", status);
            }
        }
    );
}

function showPlaceInfo(place) {
    // 기존 정보 박스 제거
    const existingInfoBox = document.querySelector('.place-info-box');
    if (existingInfoBox) {
        existingInfoBox.remove();
    }

    // 새로운 정보 박스 생성
    const newInfoBox = document.createElement('div');
    newInfoBox.classList.add('place-info-box');


    // 영업 여부 처리
    const isOpen = place.opening_hours
        ? place.opening_hours.open_now
            ? '영업 중'
            : '영업 종료'
        : '정보 없음';

    // 정보 삽입
    newInfoBox.innerHTML = `
        <h3>장소 정보</h3>
        <p><strong>이름:</strong> ${place.name}</p>
        <p><strong>평점:</strong> ${place.rating || '없음'}</p>
        <p><strong>주소:</strong> ${place.formatted_address || '없음'}</p>
        <p><strong>전화번호:</strong> ${place.formatted_phone_number || '없음'}</p>
        <p><strong>웹사이트:</strong> ${
            place.website
                ? `<a href="${place.website}" target="_blank">${place.website}</a>`
                : '없음'
        }</p>
        <p><strong>영업 여부:</strong> ${isOpen}</p>
    `;

    // 스타일 적용
    newInfoBox.style.opacity = 0;
    newInfoBox.style.transition = 'opacity 0.5s';

    // 동적 너비 설정
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        newInfoBox.style.width = `${mapContainer.offsetWidth}px`;
    } else {
        console.log('map-container 요소가 없습니다.');
    }

    const infoBoxContainer = document.getElementById('map-container');
    if (infoBoxContainer) {
        infoBoxContainer.appendChild(newInfoBox);
    }

    setTimeout(() => {
        newInfoBox.style.opacity = 1;
    }, 10);

    // 추가 스타일링
    Object.assign(newInfoBox.style, {
        padding: '15px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '15px',
        fontFamily: "'Arial', sans-serif",
        color: '#333',
        backgroundColor: '#f9f9f9',
    });
}


// 크롤링 내용 태그에 추가
let allBlogLinks = [];  // 모든 블로그 링크 데이터를 저장


// 블로그 링크 가져오기
// async function fetchBlogLinks(query) {
//     try {
//         const response = await fetch(`http://localhost:5500/fetchBlogLinks?query=${encodeURIComponent(query)}`);
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         allBlogLinks = data;  // 모든 데이터를 저장

//         displayBlogLinks(allBlogLinks);  // 처음에는 모든 블로그 링크를 표시
//     } catch (error) {
//         console.error('Error fetching blog links:', error);
//     }
// }




async function fetchBlogLinks(query) {
    try {
        const response = await fetch(`https://single-frame-406609.el.r.appspot.com/fetchBlogLinks?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allBlogLinks = data;  // 모든 데이터를 저장

        displayBlogLinks(allBlogLinks);  // 처음에는 모든 블로그 링크를 표시
    } catch (error) {
        console.error('Error fetching blog links:', error);
    }
}


// 블로그 링크를 화면에 표시하는 함수
function displayBlogLinks(links) {
    const resultLinks = document.getElementById("result-links");
    resultLinks.innerHTML = ""; // 기존 결과 초기화

    links.forEach((item) => {
        const cleanTitle = item.title.replace(/<b>/g, '').replace(/<\/b>/g, '');
        const cleanDescription = item.description.replace(/<b>/g, '').replace(/<\/b>/g, '');

        const descriptionSummary = extractKeywordFromDescription(cleanDescription, ""); // 필터 없이 전체 보여주기

        const card = document.createElement("div");
        card.classList.add("blog-card");

        let formattedDate = item.postdate;
        if (Date.parse(item.postdate)) {
            const postDate = new Date(item.postdate);
            formattedDate = `${postDate.getFullYear()}-${(postDate.getMonth() + 1).toString().padStart(2, '0')}-${postDate.getDate().toString().padStart(2, '0')}`;
        }

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <h3>${cleanTitle}</h3>
                    <span>${formattedDate}</span>
                </div>
                <div class="card-back">
                    <p>${descriptionSummary}</p>
                    <a href="${item.link}" target="_blank">Visit Blog</a>
                </div>
            </div>
        `;

        card.addEventListener("click", () => {
            const cardInner = card.querySelector(".card-inner");
            cardInner.classList.toggle("flipped");
        });

        const cardBack = card.querySelector(".card-back");
        cardBack.style.overflowY = "auto";
        cardBack.style.maxHeight = "200px";

        card.style.maxWidth = "350px";
        card.style.minWidth = "300px";
        card.style.height = "auto";
        card.style.overflow = "visible";

        resultLinks.appendChild(card);
    });
}

// 필터 버튼 클릭 시 필터를 적용한 데이터만 표시
function applyFilter() {
    
    const selectedKeyword = document.getElementById("keyword-filter").value;  // 선택된 키워드
    const filteredLinks = allBlogLinks.filter(item => {
        const cleanDescription = item.description.replace(/<b>/g, '').replace(/<\/b>/g, '');
        return extractKeywordFromDescription(cleanDescription, selectedKeyword) !== "No relevant information found.";
    });
    
    displayBlogLinks(filteredLinks);  // 필터링된 결과만 표시
    moveToNextTutorialStep();
}

// 키워드로 문장 추출
function extractKeywordFromDescription(description, keyword) {
    const regex = new RegExp(`[^.]*(${keyword}[^.]*\.)`, 'gi');
    const matches = description.match(regex);

    if (matches && matches.length > 0) {
        return matches[0];  // 첫 번째 매칭된 문장 반환
    } else {
        return "No relevant information found.";  // 키워드가 없다면 기본 메시지
    }
}



// 튜토리얼 단계를 진행하는 함수
function moveToNextTutorialStep() {
    hideTutorialPopup();

    tutorialStepIndex++;
    if (tutorialStepIndex < tutorialSteps.length) {
        const step = tutorialSteps[tutorialStepIndex];
        if (!step.target) {
            console.error(`튜토리얼 단계 ${tutorialStepIndex}에 대상(target)이 없습니다.`);
        } else {
            console.log(`튜토리얼 ${tutorialStepIndex}로 이동: ${step.message}`); // 디버깅 로그
            showTutorialPopup(step.message);
            step.target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    } else {
        // 마지막 단계가 완료되었을 경우
        saveTutorialState(); // 튜토리얼 완료 상태 저장
        console.log("튜토리얼이 완료되었습니다!");
    }
}






// 튜토리얼 팝업 표시 (동영상 포함)
function showTutorialPopup(message, targetElement, videoUrl) {
    const popup = document.getElementById("tutorial-popup");

    if (!popup || !targetElement) {
        console.error("튜토리얼 팝업 또는 대상 요소가 없습니다.");
        return;
    }

    // 팝업 메시지 및 동영상 설정
    popup.querySelector(".message").textContent = message;

    const videoElement = popup.querySelector(".tutorial-video");
    if (videoElement) {
        if (videoUrl) {
            videoElement.src = videoUrl;
            videoElement.style.display = "block"; // 동영상 보이기
            videoElement.play(); // 동영상 자동 재생
        } else {
            videoElement.style.display = "none"; // 동영상 숨기기
            videoElement.pause(); // 동영상 재생 멈춤
        }
    }

    // 목표 요소 위치 계산
    const rect = targetElement.getBoundingClientRect();
    const scrollOffset = window.scrollY || document.documentElement.scrollTop;

    // 팝업 위치 설정
    popup.style.display = "block";
    popup.style.top = `${rect.bottom + scrollOffset + 10}px`;
    popup.style.left = `${rect.left + rect.width / 2 - popup.offsetWidth / 2}px`;

    // 화면 밖으로 나가는 경우 조정
    const windowWidth = window.innerWidth;
    const popupRightEdge = popup.offsetLeft + popup.offsetWidth;

    if (popupRightEdge > windowWidth) {
        popup.style.left = `${windowWidth - popup.offsetWidth - 10}px`;
    }
    if (popup.offsetLeft < 0) {
        popup.style.left = "10px";
    }

    console.log(`튜토리얼 ${tutorialStepIndex + 1}: ${message}`);
}



// 튜토리얼 팝업 숨기기
function hideTutorialPopup() {
    const popup = document.getElementById("tutorial-popup");
    if (popup) {
        const videoElement = popup.querySelector(".tutorial-video");
        if (videoElement) {
            videoElement.pause(); // 동영상 멈추기
        }
        popup.style.display = "none";
    }
}





// 튜토리얼 스킵 버튼 처리
document.getElementById('skip-tutorial').addEventListener('click', function () {
    const popup = document.getElementById('tutorial-popup');
    popup.style.display = 'none';  // 팝업 숨기기
    tutorialStepIndex = tutorialSteps.length;  // 튜토리얼 종료
    saveTutorialState();  // 상태 저장
    console.log("튜토리얼이 스킵되었습니다.");
});







function manageLocalStorage(action) {
    if (action === 'backup') {
        // 로컬스토리지를 백업하여 sessionStorage에 저장
        const backup = { ...localStorage };
        sessionStorage.setItem('localStorageBackup', JSON.stringify(backup));
        console.log('로컬 스토리지를 백업했습니다:', backup);
    } else if (action === 'clear') {
        // 로컬스토리지를 초기화
        localStorage.clear();
        console.log('로컬 스토리지를 초기화했습니다.');
    } else if (action === 'restore') {
        // 로컬스토리지 복원
        const backup = JSON.parse(sessionStorage.getItem('localStorageBackup'));
        if (backup) {
            Object.keys(backup).forEach(key => {
                localStorage.setItem(key, backup[key]);
            });
            console.log('로컬 스토리지를 복원했습니다:', backup);
        } else {
            console.error('백업 데이터가 없습니다.');
        }
    } else {
        console.error('잘못된 action입니다. "backup", "clear", "restore" 중 하나를 사용하세요.');
    }
}


// 페이지 로드 완료 시 실행
window.onload = function () {
    initMap();
    startTutorial(); // 튜토리얼 시작
};


document.getElementById("next-tutorial").addEventListener("click", function () {
    hideTutorialPopup(); // 현재 팝업 숨기기
    tutorialStepIndex++; // 다음 단계로 진행
    if (tutorialStepIndex < tutorialSteps.length) {
        const step = tutorialSteps[tutorialStepIndex];
        showTutorialPopup(step.message, step.target, step.video); // 다음 단계 팝업 표시
    } else {
        console.log("튜토리얼이 완료되었습니다!");
        saveTutorialState(); // 튜토리얼 완료 상태 저장
    }
});




