#include <GL/glut.h>
#include <math.h>

#define NPTS 13 // número total de pontos

typedef struct
{
    float x, y;
} Point;

Point P[NPTS] = {
    {100.0f, 100.0f}, {200.0f, 400.0f}, {400.0f, 100.0f}, {500.0f, 400.0f}, {600.0f, 200.0f}, {700.0f, 500.0f}, {800.0f, 100.0f}, {850.0f, 300.0f}, {900.0f, 450.0f}, {950.0f, 200.0f}, {1000.0f, 400.0f}, {1100.0f, 100.0f}, {1150.0f, 300.0f}};

int dragPoint = -1;

float distance(Point a, Point b)
{
    return sqrtf((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
}

Point lerp(Point a, Point b, float t)
{
    Point r;
    r.x = (1 - t) * a.x + t * b.x;
    r.y = (1 - t) * a.y + t * b.y;
    return r;
}

// Casteljau para o segmento que vai de P[i] até P[i+3]
Point casteljau_segment(int i, float t)
{
    Point A = lerp(P[i], P[i + 1], t);
    Point B = lerp(P[i + 1], P[i + 2], t);
    Point C = lerp(P[i + 2], P[i + 3], t);
    Point D = lerp(A, B, t);
    Point E = lerp(B, C, t);
    return lerp(D, E, t);
}

void drawCatHead(float x, float y, float scale)
{
    glPushMatrix();
    glTranslatef(x, y, 0.0f);
    glScalef(scale, scale, 1.0f);

    glBegin(GL_TRIANGLE_FAN);
    glVertex2f(0.0f, 0.0f);
    for (int i = 0; i <= 40; i++)
    {
        float ang = i * 2.0f * M_PI / 40;
        glVertex2f(cosf(ang) * 10.0f, sinf(ang) * 10.0f);
    }
    glEnd();

    glBegin(GL_TRIANGLES);
    glVertex2f(-9.0f, 8.0f);
    glVertex2f(-11.0f, 18.0f);
    glVertex2f(-1.0f, 8.0f);
    glEnd();

    glBegin(GL_TRIANGLES);
    glVertex2f(9.0f, 8.0f);
    glVertex2f(11.0f, 18.0f);
    glVertex2f(1.0f, 8.0f);
    glEnd();

    glPopMatrix();
}

void drawControlPoints()
{
    for (int i = 0; i < NPTS; i++)
    {
        if (i % 3 == 0)
            glColor3f(0.0f, 0.7f, 0.0f);
        else
            glColor3f(1.0f, 0.0f, 0.0f);

        drawCatHead(P[i].x, P[i].y, 1.0f);
    }

    glColor3f(1.0f, 1.0f, 1.0f);
    glBegin(GL_LINE_STRIP);
    for (int i = 0; i < NPTS; i++)
        glVertex2f(P[i].x, P[i].y);
    glEnd();
}

void drawSpline()
{
    glColor3f(1.0f, 1.0f, 1.0f);
    glBegin(GL_LINE_STRIP);
    for (int seg = 0; seg <= NPTS - 4; seg += 3)
    {
        for (float t = 0.0f; t <= 1.0f; t += 0.01f)
        {
            Point pt = casteljau_segment(seg, t);
            glVertex2f(pt.x, pt.y);
        }
    }
    glEnd();
}

void display()
{
    glClear(GL_COLOR_BUFFER_BIT);
    drawControlPoints();
    drawSpline();
    glutSwapBuffers();
}

void mouse(int button, int state, int x, int y)
{
    y = 600 - y;
    if (state == GLUT_DOWN)
    {
        for (int i = 0; i < NPTS; i++)
        {
            if (distance(P[i], (Point){(float)x, (float)y}) < 20.0f)
            {
                dragPoint = i;
                break;
            }
        }
    }
    else
    {
        dragPoint = -1;
    }
}

void motion(int x, int y)
{
    y = 600 - y;
    if (dragPoint != -1)
    {
        P[dragPoint].x = (float)x;
        P[dragPoint].y = (float)y;
        glutPostRedisplay();
    }
}

void init()
{
    glClearColor(0.0, 0.0, 0.0, 1.0);
    glMatrixMode(GL_PROJECTION);
    gluOrtho2D(0.0, 1200.0, 0.0, 600.0);
}

int main(int argc, char **argv)
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB);
    glutInitWindowSize(1200, 600);
    glutCreateWindow("Spline com 4 segmentos");
    init();
    glutDisplayFunc(display);
    glutMouseFunc(mouse);
    glutMotionFunc(motion);
    glutMainLoop();
    return 0;
}
