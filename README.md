# KBL 게시글 모음 사이트 배포 안내

한국 농구 커뮤니티 글을 한 곳에서 모아 보여주는 이 프로젝트를, 개발 지식이 거의 없는 사용자가 인터넷에서 누구나 접속할 수 있도록 배포하는 방법을 단계별로 정리했습니다. 아래 순서를 차근차근 따라 하면 됩니다.

## 1. 준비물
- **GitHub 계정**: 코드 저장소를 올려둘 곳입니다. (https://github.com)
- **Render 계정**: Node.js 서버를 무료로 배포할 수 있는 호스팅 서비스입니다. (https://render.com)
- 인터넷에 연결된 PC 한 대

> 💡 Render를 사용하는 이유: 이 프로젝트는 웹페이지와 함께 동작하는 백엔드(Node.js + Express)가 필요합니다. 정적 웹 호스팅(Vercel, GitHub Pages 등)만으로는 게시판 글을 모아오는 기능을 수행할 수 없어서, 서버를 항상 실행해 줄 플랫폼이 필요합니다.

## 2. GitHub에 코드 올리기
1. GitHub에 로그인합니다.
2. 우측 상단 **+** 버튼 → **New repository**를 클릭합니다.
3. 저장소 이름(예: `kblgallery`)을 입력하고 **Create repository**를 클릭합니다.
4. 현재 프로젝트 폴더(`/workspace/kblgallery`) 전체를 새 저장소에 업로드합니다. 방법은 두 가지입니다.
   - Git을 사용할 줄 모른다면, GitHub 저장소 화면에서 **uploading an existing file** 링크를 눌러 폴더 안의 모든 파일을 업로드합니다.
   - Git을 사용할 수 있다면, 다음 명령으로 업로드합니다.
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/<사용자명>/<저장소명>.git
     git push -u origin main
     ```

## 3. Render에서 새 Web Service 만들기
1. https://dashboard.render.com 에 접속해 로그인합니다.
2. 대시보드에서 **New +** 버튼을 누르고 **Web Service**를 선택합니다.
3. GitHub 계정 연동을 요청하면 **Authorize**를 눌러 연결합니다.
4. 방금 올린 GitHub 저장소를 선택합니다.
5. 배포 설정을 다음과 같이 맞춥니다.
   - **Name**: 원하는 서비스 이름 (예: `kblgallery`)
   - **Region**: 가까운 지역 (예: Singapore)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: 무료(FREE) 플랜 선택
6. **Create Web Service**를 누르면 Render가 자동으로 빌드 후 서버를 실행합니다. 첫 배포는 몇 분 정도 걸릴 수 있습니다.

## 4. 배포 완료 후 확인하기
1. Render가 빌드를 마치면 대시보드 서비스 화면에 **Live** 상태와 함께 `https://<서비스명>.onrender.com` 형태의 주소가 표시됩니다.
2. 해당 주소를 브라우저에서 열면 `KBL 게시글 모음` 사이트가 나타납니다.
3. 화면 좌측 상단의 새로고침 버튼 또는 5분마다 자동 새로고침을 통해 최신 글을 확인할 수 있습니다.

## 5. 추후 업데이트 배포하기
- GitHub 저장소의 `main` 브랜치에 변경사항을 올리면 Render가 자동으로 새 빌드를 실행합니다.
- 새 글 수집이 잘 안 된다면 Render 서비스 화면의 **Logs** 탭을 확인해 오류 메시지를 살펴보세요.

## 6. 자주 묻는 질문
### 글이 표시되지 않아요.
- 원본 사이트에서 일시적으로 차단했을 수 있습니다. 잠시 후 다시 시도하거나 Render 대시보드에서 서버를 재시작하세요.
- Render 무료 플랜은 15분 동안 접속이 없으면 잠시 잠들었다가, 첫 접속 때 다시 깨우는데 1분 정도 걸릴 수 있습니다.

### 다른 호스팅을 사용해도 되나요?
- Railway, Fly.io 등 Node.js를 실행할 수 있는 호스팅이면 대부분 동일한 방식으로 동작합니다. 중요한 것은 `npm install` → `npm start`로 서버를 실행할 수 있는 환경이어야 한다는 점입니다.

---
위 단계를 그대로 따라 하면 개발 지식이 거의 없더라도 인터넷에서 접속 가능한 `KBL 게시글 모음` 사이트를 배포할 수 있습니다. 문제가 생기면 Render의 공식 문서(https://render.com/docs)나 GitHub Discussions를 참고해 보세요.
