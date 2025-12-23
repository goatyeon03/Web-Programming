document.addEventListener('DOMContentLoaded', () => {
    // 튜토리얼 메시지 리스트
    const tutorialSteps = [
        '이 웹사이트는 여행 정보를 제공합니다. 아래의 타일을 클릭하세요!',
        '카페, 식당, 관광지 중 하나를 선택할 수 있습니다.',
        '탐색하려는 카테고리를 선택 후 정보를 확인하세요!'
    ];

    let currentStep = 0; // 현재 단계

    // 튜토리얼 팝업 요소
    const tutorialPopup = document.getElementById('tutorial-popup');
    const tutorialText = document.getElementById('tutorial-text');
    const skipButton = document.getElementById('skip-tutorial');
    const nextButton = document.getElementById('next-tutorial');

    // 로컬 스토리지 확인
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    if (tutorialCompleted === 'true') {
        tutorialPopup.classList.add('hidden'); // 튜토리얼 숨김
        return;
    }

    // 튜토리얼 시작
    tutorialPopup.classList.remove('hidden');
    tutorialText.textContent = tutorialSteps[currentStep];

    // "건너뛰기" 버튼 클릭 이벤트
    skipButton.addEventListener('click', () => {
        tutorialPopup.classList.add('hidden');
        localStorage.setItem('tutorialCompleted', 'true'); // 로컬 스토리지에 완료 저장
    });

    // "다음" 버튼 클릭 이벤트
    nextButton.addEventListener('click', () => {
        currentStep++;
        if (currentStep < tutorialSteps.length) {
            tutorialText.textContent = tutorialSteps[currentStep];
        } else {
            // 튜토리얼 종료
            tutorialPopup.classList.add('hidden');
            localStorage.setItem('tutorialCompleted', 'true'); // 완료 저장
        }
    });
});



// 로컬 스토리지 관리 함수
function manageLocalStorage(action) {
    if (action === 'backup') {
        const backup = { ...localStorage };
        sessionStorage.setItem('localStorageBackup', JSON.stringify(backup));
        console.log('로컬 스토리지를 백업했습니다:', backup);
    } else if (action === 'clear') {
        localStorage.clear();
        console.log('로컬 스토리지를 초기화했습니다.');
    } else if (action === 'restore') {
        const backup = JSON.parse(sessionStorage.getItem('localStorageBackup'));
        if (backup) {
            Object.keys(backup).forEach(key => {
                localStorage.setItem(key, backup[key]);
            });
            console.log('로컬 스토리지를 복원했습니다:', backup);
        } else {
            console.error('백업 데이터가 없습니다.');
        }
    }
}

