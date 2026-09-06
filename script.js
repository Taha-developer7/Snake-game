document.addEventListener('DOMContentLoaded', function() {
  const boardSize = 20;
  const totalCells = boardSize * boardSize;
  const accountKey = 'neonSnakeAccount';
  const sessionKey = 'neonSnakeSession';
  let snake, direction, food, score, interval, accountMode = 'signIn';
  const board = document.getElementById('gameBoard');
  const scoreElement = document.getElementById('score');
  const bestScoreElement = document.getElementById('bestScore');
  const accountButton = document.getElementById('accountButton');
  const accountModal = document.getElementById('accountModal');
  const accountForm = document.getElementById('accountForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const formMessage = document.getElementById('formMessage');
  const modalTitle = document.getElementById('modalTitle');
  const modalCopy = document.getElementById('modalCopy');
  const submitAccount = document.getElementById('submitAccount');

  for (let i = 0; i < totalCells; i++) board.appendChild(document.createElement('div'));
  const cells = board.querySelectorAll('div');
  const currentUser = () => localStorage.getItem(sessionKey);
  const getAccount = () => JSON.parse(localStorage.getItem(accountKey) || 'null');

  function updateAccountUI() {
    const user = currentUser();
    accountButton.innerHTML = user ? `${user} <span class="button-arrow">↗</span>` : 'Sign in <span class="button-arrow">↗</span>';
    const account = getAccount();
    bestScoreElement.textContent = account && account.username === user ? account.best : '0';
  }
  function drawSnake() {
    cells.forEach(cell => cell.classList.remove('snake', 'head', 'food'));
    snake.forEach((index, position) => cells[index].classList.add(position === 0 ? 'head' : 'snake'));
    cells[food].classList.add('food');
  }
  function generateFood() { do { food = Math.floor(Math.random() * totalCells); } while (snake.includes(food)); }
  function endGame() {
    clearInterval(interval);
    document.querySelector('.live-label').innerHTML = '<i></i> GAME OVER';
    const account = getAccount();
    if (account && account.username === currentUser() && score > account.best) {
      account.best = score;
      localStorage.setItem(accountKey, JSON.stringify(account));
      bestScoreElement.textContent = score;
    }
  }
  function moveSnake() {
    const head = snake[0] + direction;
    const hitWall = head < 0 || head >= totalCells || (direction === 1 && snake[0] % boardSize === boardSize - 1) || (direction === -1 && snake[0] % boardSize === 0);
    if (hitWall || snake.includes(head)) { endGame(); return; }
    snake.unshift(head);
    if (head === food) { score++; scoreElement.textContent = score; generateFood(); } else snake.pop();
    drawSnake();
  }
  function setDirection(nextDirection) {
    if (nextDirection === 'left' && direction !== 1) direction = -1;
    if (nextDirection === 'up' && direction !== boardSize) direction = -boardSize;
    if (nextDirection === 'right' && direction !== -1) direction = 1;
    if (nextDirection === 'down' && direction !== -boardSize) direction = boardSize;
  }
  function resetGame() {
    clearInterval(interval); snake = [2, 1, 0]; direction = 1; score = 0;
    scoreElement.textContent = score;
    document.querySelector('.live-label').innerHTML = '<i></i> READY';
    generateFood(); drawSnake(); interval = setInterval(moveSnake, 180);
  }
  function setAccountMode(mode) {
    accountMode = mode;
    const createMode = mode === 'create';
    document.getElementById('signInTab').classList.toggle('active', !createMode);
    document.getElementById('createTab').classList.toggle('active', createMode);
    modalTitle.textContent = createMode ? 'Make it yours.' : 'Welcome back.';
    modalCopy.textContent = createMode ? 'Create a local arcade profile and start your streak.' : 'Sign in to keep your best runs attached to your name.';
    submitAccount.innerHTML = createMode ? 'Create profile <span>↗</span>' : 'Enter the arcade <span>↗</span>';
    formMessage.textContent = '';
  }
  accountButton.addEventListener('click', function() {
    if (currentUser()) { localStorage.removeItem(sessionKey); updateAccountUI(); resetGame(); return; }
    accountModal.hidden = false; usernameInput.focus();
  });
  document.addEventListener('keydown', function(event) {
    const keyMap = { ArrowLeft: 'left', ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', a: 'left', w: 'up', d: 'right', s: 'down' };
    if (keyMap[event.key]) { event.preventDefault(); setDirection(keyMap[event.key]); }
    if (event.key.toLowerCase() === 'r') resetGame();
  });
  document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => setDirection(button.dataset.direction)));
  document.getElementById('restartButton').addEventListener('click', resetGame);
  document.getElementById('closeModal').addEventListener('click', () => { accountModal.hidden = true; });
  document.getElementById('guestButton').addEventListener('click', () => { accountModal.hidden = true; });
  document.getElementById('signInTab').addEventListener('click', () => setAccountMode('signIn'));
  document.getElementById('createTab').addEventListener('click', () => setAccountMode('create'));
  accountForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = usernameInput.value.trim().toLowerCase();
    const existing = getAccount();
    if (accountMode === 'create') localStorage.setItem(accountKey, JSON.stringify({ username, password: passwordInput.value, best: 0 }));
    else if (!existing || existing.username !== username || existing.password !== passwordInput.value) { formMessage.textContent = 'That profile or password does not match.'; return; }
    localStorage.setItem(sessionKey, username); accountModal.hidden = true; accountForm.reset(); updateAccountUI(); resetGame();
  });
  updateAccountUI();
  resetGame();
});
