$(document).ready(function() {
  const boardSize = 20;
  const totalCells = boardSize * boardSize;
  let snake = [2,1,0];
  let direction = 1;
  let food = 0;
  let score = 0;
  let speed = 200;
  let interval;

  for(let i=0; i<totalCells; i++) {
    $('#gameBoard').append('<div></div>');
  }

  const cells = $('#gameBoard div');

  function drawSnake() {
    cells.removeClass('snake food');
    snake.forEach(i => cells.eq(i).addClass('snake'));
    cells.eq(food).addClass('food');
  }

  function generateFood() {
    do {
      food = Math.floor(Math.random() * totalCells);
    } while(snake.includes(food));
  }

  function moveSnake() {
    const head = snake[0] + direction;

    if (
      (head >= totalCells && direction === boardSize) ||
      (head < 0 && direction === -boardSize) ||
      (head % boardSize === 0 && direction === 1 && snake[0] % boardSize === boardSize-1) ||
      (head % boardSize === boardSize-1 && direction === -1 && snake[0] % boardSize === 0) ||
      snake.includes(head)
    ) {
      clearInterval(interval);
      alert('Game Over! Score: ' + score);
      return;
    }

    snake.unshift(head);

    if(head === food) {
      score++;
      $('#score').text(score);
      generateFood();
    } else {
      snake.pop();
    }

    drawSnake();
  }

  function changeDirection(e) {
    switch(e.keyCode) {
      case 37: if(direction !== 1) direction = -1; break;
      case 38: if(direction !== boardSize) direction = -boardSize; break;
      case 39: if(direction !== -1) direction = 1; break;
      case 40: if(direction !== -boardSize) direction = boardSize; break;
    }
  }

  $(document).keydown(changeDirection);

  generateFood();
  drawSnake();
  interval = setInterval(moveSnake, speed);
});