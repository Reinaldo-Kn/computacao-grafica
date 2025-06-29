/*
	Author			:	ROHIT BABU KADAM
	Description		:	Snake game using opengl
	Technology		:	C , OpenGl
	Platform		:	Linux

*/

#include "GameHeader.h"

void helpDisplay()
{
	system("clear");
	printf("\n---------------------[ Snake Game ]------------------------\n");
	printf("\n              Developed by Rohit kadam\n\n");
	printf("-----------------------------------------------------------\n");
	printf("\n p : Start / Play / Pause ");
	printf("\n q : Exit");
	printf("\n     Use arrow key to move the snake ");
	printf("\n [1 - 9] : change level of your game");
	printf("\n-----------------------------------------------------------\n");
	fflush(stdin);
}

void playDisplay()
{
	system("clear");
	helpDisplay();
	printf("\n\n");
	printf("         -------------\n");
	printf("           Score: %d \n", snake_size - 5);
	printf("         -------------");
	printf("\n");
}

void out()
{
	playDisplay();
	printf("\n----GAME OVER----\n");
	initGame();
}

void quit()
{
	printf("\nThank for Playing Game\n");
	printf("-----------------------------------------------------------\n");
	exit(0);
}

void myinit(void)
{
	glPointSize(4.0);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	gluOrtho2D(0.0, 640.0, 0.0, 480.0);
	glClearColor(1.0, 1.0, 1.0, 1.0);
	initGame();
	initBlocks();
	play = TRUE;
}

void moveSnake(void)
{
	int move_x = change->prev->x + change_x;
	int move_y = change->prev->y + change_y;
	// se passar da borda volta do outro lado
	if (move_x >= 640)
		move_x = 0;
	if (move_x < 0)
		move_x = 640 - 1;
	if (move_y >= 480)
		move_y = 0;
	if (move_y < 0)
		move_y = 480 - 1;

	if (search(move_x, move_y) || checkBlockCollision(move_x, move_y))
		out();
	else
	{
		if (checkEqualNode(move_x, move_y, food_x, food_y))
		{
			addNode(change);
			playDisplay();
			createFood();
		}

		change->x = move_x;
		change->y = move_y;

		drawSnake();
		drawHead(change->x, change->y);
		displayFood();

		glFlush();
		wait_for_time(speed);

		change = change->next;
		glutPostRedisplay();
	}
}

void mydisplay(void)
{
	glClear(GL_COLOR_BUFFER_BIT);
	glFlush();
	if (play)
	{
		updateBlocksColor();
		drawBlocks();
		moveSnake();
	}

	else
	{
		playDisplay();
		updateBlocksColor();
		drawBlocks();
		drawSnake();
		drawHead(change->prev->x, change->prev->y);
		displayFood();
		glFlush();
	}
}

void mySpecialKeyboard(int key, int x, int y)
{
	if (play)
	{
		switch (key)
		{
		case GLUT_KEY_RIGHT:
			if (direction != LEFT)
			{
				direction = RIGHT;
				change_x = 11;
				change_y = 0;
			}
			break;

		case GLUT_KEY_LEFT:
			if (direction != RIGHT)
			{
				direction = LEFT;
				change_x = -11;
				change_y = 0;
			}
			break;

		case GLUT_KEY_UP:
			if (direction != DOWN)
			{
				direction = UP;
				change_x = 0;
				change_y = 11;
			}
			break;

		case GLUT_KEY_DOWN:
			if (direction != UP)
			{
				direction = DOWN;
				change_x = 0;
				change_y = -11;
			}
			break;
		}

		glutPostRedisplay();
	}
}

void myKeyboard(unsigned char key, int x, int y)
{

	switch (key)
	{
	case 'p':
		if (play)
		{
			play = FALSE;
		}
		else
			play = TRUE;
		break;

	case 'q':
		out();
		quit();
		break;

	case '1':
	case '2':
	case '3':
	case '4':
	case '5':
	case '6':
	case '7':
	case '8':
	case '9':
		speed = (int)key - 48;
		break;
	}
	glutPostRedisplay();
}

int main(int argc, char **argv)
{
	char ch;
	helpDisplay();
	while (1)
	{
		fflush(stdin);
		printf("\n\nEnter your Choice: ");
		scanf(" %c", &ch);
		if (ch == 'p')
		{
			glutInit(&argc, argv);
			glutInitDisplayMode(GLUT_SINGLE | GLUT_RGB);
			glutInitWindowSize(640, 480);
			glutInitWindowPosition(800, 300);
			glutCreateWindow("Snake Game");
			glutDisplayFunc(mydisplay); // Registering the display function
			glutSpecialFunc(mySpecialKeyboard);
			glutKeyboardFunc(myKeyboard);
			myinit();
			glutMainLoop();
		}
		else if (ch == 'q')
		{
			quit();
		}
		else
			helpDisplay();
	}
	printf("\n");
	return 0;
}
