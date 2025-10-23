# KBL 게시글 모음 사이트 배포 안내

이 프로젝트는 매니아, 디시인사이드 남자농구 마이너 갤러리, 에펨코리아 농구 게시판(KBL 탭) 등 KBL 관련 커뮤니티를 한 화면에서 열람할 수 있도록 도와주는 단순한 프레임 기반 웹사이트입니다. 개발 지식이 많지 않아도 Render를 이용해 손쉽게 배포할 수 있도록 아래에 과정을 정리했습니다.

## 1. 준비물
- **GitHub 계정**: 프로젝트 코드를 올려둘 저장소가 필요합니다. (https://github.com)
- **Render 계정**: Node.js 애플리케이션을 무료로 배포할 수 있습니다. (https://render.com)
- 인터넷에 연결된 PC 한 대

> 💡 Render를 선택한 이유: 프런트엔드 정적 파일을 안정적으로 제공하려면 항상 켜져 있는 간단한 Node.js 서버가 필요합니다. Render의 무료 플랜이면 충분합니다.

## 2. GitHub에 코드 올리기
1. GitHub에 로그인합니다.
2. 우측 상단 **+** 버튼 → **New repository**를 클릭합니다.
3. 저장소 이름(예: `kblgallery`)을 입력하고 **Create repository**를 선택합니다.
4. 현재 프로젝트 폴더(`/workspace/kblgallery`) 전체를 저장소에 업로드합니다.
   - Git을 사용하지 않는다면 저장소 화면에서 **uploading an existing file** 링크를 눌러 파일을 전부 업로드합니다.
   - Git을 사용할 수 있다면 다음 명령을 실행합니다.
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
2. 대시보드에서 **New +** 버튼을 누르고 **Web Service**를 고릅니다.
3. GitHub 연동 요청이 뜨면 **Authorize**를 눌러 연결합니다.
4. 앞서 업로드한 GitHub 저장소를 선택합니다.
5. 배포 설정을 다음과 같이 지정합니다.
   - **Name**: 원하는 서비스 이름 (예: `kblgallery`)
   - **Region**: 가까운 지역 (예: Singapore)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: 무료(FREE) 플랜
6. **Create Web Service**를 누르면 자동으로 빌드와 배포가 진행됩니다. 최초 배포에는 몇 분이 걸릴 수 있습니다.

## 4. 배포 후 확인하기
1. 배포가 완료되면 Render 대시보드에서 `https://<서비스명>.onrender.com` 주소가 활성화됩니다.
2. 해당 주소에 접속하면 왼쪽에는 커뮤니티 목록, 오른쪽에는 선택한 커뮤니티의 실제 웹사이트가 프레임으로 표시됩니다.
3. 프레임이 비어 보이거나 차단되면 상단의 **새 창에서 열기** 버튼을 눌러 원본 사이트로 이동하면 됩니다.

## 5. 변경 사항 반영하기
- GitHub 저장소의 `main` 브랜치에 새 커밋을 푸시하면 Render가 자동으로 최신 코드를 다시 배포합니다.
- 프레임이 제대로 표시되지 않을 경우, 해당 커뮤니티가 프레임 로딩을 막고 있을 가능성이 있습니다. 이때는 "새 창에서 열기" 기능으로 접속합니다.

## 6. 자주 묻는 질문
### 프레임이 하얗게 나오거나 에러가 뜹니다.
- 일부 사이트는 보안 정책(X-Frame-Options 등) 때문에 다른 사이트에서 프레임으로 여는 것을 막습니다. 이 경우 프레임 오른쪽 위의 링크를 눌러 새 탭에서 보시면 됩니다.
- Render 무료 플랜은 15분간 접속이 없으면 앱이 잠들 수 있습니다. 처음 접속했을 때 1분 정도 기다리면 자동으로 깨어납니다.

### Render 대신 다른 서비스를 써도 되나요?
- Railway, Fly.io 등에서 `npm install` → `npm start`만 실행해주면 동일하게 동작합니다. 단, 항상 실행 중인 Node.js 환경이 필요합니다.

---
이 안내에 따라 진행하면 `KBL 게시글 모음` 사이트를 누구나 접근할 수 있도록 배포할 수 있습니다. 추가 도움이 필요하면 Render 공식 문서(https://render.com/docs)를 참고해 주세요.
