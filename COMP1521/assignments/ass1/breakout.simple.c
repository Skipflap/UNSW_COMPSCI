/**
 * breakout.simple.c
 *
 * A copy of a simple game of Breakout.
 *
 * Prior to translating this program into MIPS assembly, you may wish
 * to simplify the contents of this file. You can replace complex C
 * constructs like loops with constructs which will be easier to translate
 * into assembly. To help you check that you haven't altered the behaviour of
 * the game, you can run some automated tests using the command
 *     1521 autotest breakout.simple
 * The simplified C version of this code is not marked.
 */

#include <stdio.h>
#include <stdlib.h>

/////////////////// Constants ///////////////////

#define FALSE 0
#define TRUE 1

#define MAX_GRID_WIDTH 60
#define MIN_GRID_WIDTH 6
#define GRID_HEIGHT 12

#define BRICK_ROW_START 2
#define BRICK_ROW_END 7
#define BRICK_WIDTH 3
#define PADDLE_WIDTH 6
#define PADDLE_ROW (GRID_HEIGHT - 1)

#define BALL_FRACTION 24
#define BALL_SIM_STEPS 3
#define MAX_BALLS 3
#define BALL_NONE 'X'
#define BALL_NORMAL 'N'
#define BALL_SUPER 'S'

#define VERTICAL 0
#define HORIZONTAL 1

#define MAX_SCREEN_UPDATES 24

#define KEY_LEFT 'a'
#define KEY_RIGHT 'd'
#define KEY_SUPER_LEFT 'A'
#define KEY_SUPER_RIGHT 'D'
#define KEY_STEP '.'

#define MANY_BALL_CHAR '#'
#define ONE_BALL_CHAR '*'
#define PADDLE_CHAR '-'
#define EMPTY_CHAR ' '
#define GRID_TOP_CHAR '='
#define GRID_SIDE_CHAR '|'

///////////////////// Types /////////////////////

struct ball
{
    int x;
    int y;

    int x_fraction;
    int y_fraction;
    int dy;
    int dx;

    char state;
};

struct screen_update
{
    int x;
    int y;
};

//////////////////// Globals ////////////////////

int grid_width;
struct ball balls[MAX_BALLS];
char bricks[GRID_HEIGHT][MAX_GRID_WIDTH];
int bricks_destroyed;
int total_bricks;
int paddle_x;
int score;
int combo_bonus;

struct screen_update screen_updates[MAX_SCREEN_UPDATES];
int num_screen_updates;
int whole_screen_update_needed;
int no_auto_print;

////////////////// Prototypes ///////////////////

// Subset 0
void print_welcome(void);
int main(void);

// Subset 1
void read_grid_width(void);
void game_loop(void);
void initialise_game(void);
void move_paddle(int direction);
int count_total_active_balls(void);
char print_cell(int row, int col);

// Subset 2
void register_screen_update(int x, int y);
int count_balls_at_coordinate(int row, int col);
void print_game(void);
int spawn_new_ball(void);
void move_balls(int sim_steps);

// Subset 3
void move_ball_in_axis(struct ball *ball, int axis, int *fraction, int delta);
void hit_brick(int row, int original_col);
void check_ball_paddle_collision(void);
void move_ball_one_cell(struct ball *ball, int axis, int direction);

// Provided functions. You might find it useful
// to look at their implementation.
int run_command(void);
void print_debug_info(void);
void print_screen_updates(void);

/////////////////// Subset 0 ////////////////////

// Print out information on how to play this game.
void print_welcome(void)
{
    printf("Welcome to 1521 breakout! In this game you control a ");
    printf("paddle (---) with\nthe %c and %c", KEY_LEFT, KEY_RIGHT);
    printf(" (or %c and %c for fast ", KEY_SUPER_LEFT, KEY_SUPER_RIGHT);
    printf("movement) keys, and your goal is\nto bounce the ball (");
    printf("%c) off of the bricks (digits). Every ten ", ONE_BALL_CHAR);
    printf("bricks\ndestroyed spawns an extra ball. The %c", KEY_STEP);
    printf(" key will advance time one step.\n\n");
}

// Entry point to the game
int main(void)
{
    print_welcome();

    read_grid_width();
    initialise_game();

    game_loop();

    return 0;
}

/////////////////// Subset 1 ////////////////////

// Read in and validate the grid width.
void read_grid_width(void)
{
    int done = 0;

start_loop:
    if (!done)
    {
        printf("Enter the width of the playing field: ");
        scanf("%d", &grid_width);

        if (grid_width < MIN_GRID_WIDTH || grid_width > MAX_GRID_WIDTH)
        {
            printf("Bad input, the width must be between %d and %d\n", MIN_GRID_WIDTH, MAX_GRID_WIDTH);
            goto start_loop;
        }
        if (grid_width % BRICK_WIDTH != 0)
        {
            printf("Bad input, the grid width must be a multiple of %d\n", BRICK_WIDTH);
            goto start_loop;
        }
        done = 1;
    }

end_loop:
    putchar('\n');
}

// Run the game loop: print out the game and read in and execute commands
// until the game is over.
void game_loop(void)
{
start_game:
    if (bricks_destroyed >= total_bricks)
    {
        goto check_win;
    }
    if (count_total_active_balls() <= 0)
    {
        goto check_win;
    }

    // Game loop logic
    if (!no_auto_print)
    {
        print_game();
    }

run_command_loop:
    if (!run_command())
    {
        goto run_command_loop;
    }

    goto start_game;

check_win:
    // End game checks
    if (bricks_destroyed == total_bricks)
    {
        goto win;
    }
    else
    {
        goto lose;
    }

win:
    printf("\nYou win! Congratulations!\n");
    goto print_score;

lose:
    printf("Game over :(\n");

print_score:
    printf("Final score: %d\n", score);
}

// Initialise the game state ready for a new game.
void initialise_game(void)
{
// Initialise the `bricks` 2D array.
    int row = 0;
    int col = 0;
    int i = 0;

initialise_bricks:
    if (row < GRID_HEIGHT)
        goto initialise_bricks_inner;
    row = 0;
    col = 0;
    goto initialise_balls; // Reset row and col for next loop

initialise_bricks_inner:
    if (col < grid_width)
        goto check_brick_row;
    row++;
    col = 0;
    goto initialise_bricks;

check_brick_row:
    if (BRICK_ROW_START <= row && row <= BRICK_ROW_END)
        goto set_brick_value;
    bricks[row][col] = 0;
    goto increment_col;

set_brick_value:
    bricks[row][col] = 1 + ((col / BRICK_WIDTH) % 10);
    goto increment_col;

increment_col:
    col++;
    goto initialise_bricks_inner;

initialise_balls:
    if (i < MAX_BALLS)
        goto set_ball_none;
    goto spawn_first_ball;

set_ball_none:
    balls[i].state = BALL_NONE;
    i++;
    goto initialise_balls;

spawn_first_ball:
    spawn_new_ball();
    goto set_paddle_position;

set_paddle_position:
    paddle_x = (grid_width - PADDLE_WIDTH + 1) / 2;
    goto initialise_score;

initialise_score:
    score = 0;
    bricks_destroyed = 0;
    goto calculate_total_bricks;

calculate_total_bricks:
    total_bricks = (BRICK_ROW_END - BRICK_ROW_START + 1) * (grid_width / BRICK_WIDTH);
    goto final_initialisation;

final_initialisation:
    num_screen_updates = 0;
    whole_screen_update_needed = TRUE;
    no_auto_print = 0;

    return;
}

// Move the paddle,
//    direction = 1 => right
//   direction = -1 => left
void move_paddle(int direction)
{
paddle_x += direction;

check_bounds:
    if (paddle_x < 0)
    {
        goto reverse_direction;
    }

    if (paddle_x + PADDLE_WIDTH > grid_width)
    {
        goto reverse_direction;
    }

    goto check_collision;

reverse_direction:
    paddle_x -= direction;
    goto end_function;

check_collision:
    check_ball_paddle_collision();

    int direction_indicator = (direction + 2) / 2;

    register_screen_update(paddle_x - direction_indicator, PADDLE_ROW);
    register_screen_update(paddle_x + PADDLE_WIDTH - direction_indicator, PADDLE_ROW);

end_function:
    return;
}

// Return the total number of active balls.
int count_total_active_balls(void)
{
    int count = 0;
    int i = 0;

start_loop:
    if (i < MAX_BALLS) {
        if (balls[i].state != BALL_NONE) {
            count++;
        }
        i++;
        goto start_loop;
    }

    return count;
}

// Returns the appropriate character to print, for a given coordinate
// in the grid.
char print_cell(int row, int col)
{
    int ball_count = count_balls_at_coordinate(row, col);

    if (ball_count > 1)
    {
        goto return_many_ball_char;
    }

    if (ball_count == 1)
    {
        goto return_one_ball_char;
    }

    if (row == PADDLE_ROW)
    {
        goto check_paddle_col;
    }

check_bricks:
    if (bricks[row][col])
    {
        goto return_brick_char;
    }

    goto return_empty_char;

check_paddle_col:
    if (paddle_x <= col)
    {
        goto check_paddle_col_end;
    }

    goto check_bricks;

check_paddle_col_end:
    if (col < paddle_x + PADDLE_WIDTH)
    {
        goto return_paddle_char;
    }

    goto check_bricks;

return_empty_char:
    return EMPTY_CHAR;

return_many_ball_char:
    return MANY_BALL_CHAR;

return_one_ball_char:
    return ONE_BALL_CHAR;

return_paddle_char:
    return PADDLE_CHAR;

return_brick_char:
    return '0' + (bricks[row][col] - 1);
}

/////////////////// Subset 2 ////////////////////

// Add a new coordinate to the list of (potentially) changed
// parts of the screen.
void register_screen_update(int x, int y)
{
    if (whole_screen_update_needed)
        goto end;

    if (num_screen_updates >= MAX_SCREEN_UPDATES)
    {
        whole_screen_update_needed = TRUE;
        goto end;
    }

    screen_updates[num_screen_updates].x = x;
    screen_updates[num_screen_updates].y = y;
    num_screen_updates++;

end:
    return;
}

// Returns the total number of balls at a given coordinate in the grid.
// You may want to re-use part of your `count_total_active_balls` code
// for this function.
int count_balls_at_coordinate(int row, int col)
{
    int count = 0;
    int i = 0;

start_loop:
    if (i >= MAX_BALLS)
        goto end;

    if (balls[i].state == BALL_NONE)
        goto next_iteration;

    if (balls[i].y != row)
        goto next_iteration;

    if (balls[i].x != col)
        goto next_iteration;

    count++;

next_iteration:
    i++;
    goto start_loop;

end:
    return count;
}

// Print out the full grid, as well as the current score.
void print_game(void)
{
    int row = -1, col = -1;

    // Print the score
    printf(" SCORE: %d\n", score);

row_loop_start:
    if (row >= GRID_HEIGHT) goto row_loop_end;
    col = -1;

col_loop_start:
    if (col > grid_width) {
        putchar('\n');
        row++;
        goto row_loop_start;
    }

    if (row == -1) {
        putchar(GRID_TOP_CHAR);
    } else if (col == -1 || col == grid_width) {
        putchar(GRID_SIDE_CHAR);
    } else {
        putchar(print_cell(row, col));
    }

    col++;
    goto col_loop_start;

row_loop_end:
    return;
}

// Add a new ball to the `balls` array. Returns TRUE if there
// was an unused slot and FALSE if there wasn't, so no ball could
// be created.
int spawn_new_ball(void)
{
    struct ball *new_ball = NULL;
    int i = 0;

    // Search for a new ball.
find_new_ball:
    if (i >= MAX_BALLS) goto no_new_ball;
    if (balls[i].state == BALL_NONE) {
        new_ball = &balls[i];
        goto ball_found;
    }
    i++;
    goto find_new_ball;

no_new_ball:
    // No new ball.
    return FALSE;

ball_found:
    new_ball->state = BALL_NORMAL;

    // Place the ball in the bottom centre of the grid.
    new_ball->y = PADDLE_ROW - 1;
    new_ball->x = grid_width / 2;
    new_ball->x_fraction = BALL_FRACTION / 2;
    new_ball->y_fraction = BALL_FRACTION / 2;

    register_screen_update(new_ball->x, new_ball->y);

    // Initially the ball is moving upwards.
    new_ball->dy = -BALL_FRACTION / BALL_SIM_STEPS;

    // Give the ball a small horizontal velocity, with direction
    // determined by if `grid_width` is even.
    new_ball->dx = BALL_FRACTION / BALL_SIM_STEPS / 4;
    if (grid_width % 2 == 0)
    {
        new_ball->dx *= -1;
    }

    return TRUE;
}

// Handle the movement of all balls in both axis for `sim_steps` steps.
void move_balls(int sim_steps)
{
    int step = 0;
    int i = 0;
    struct ball *ball = NULL;

move_balls_step_loop:
    if (step >= sim_steps) goto move_balls_end;
    i = 0;

move_balls_ball_loop:
    if (i >= MAX_BALLS) goto move_balls_next_step;
    ball = &balls[i];

    if (ball->state == BALL_NONE) goto move_balls_continue;

    move_ball_in_axis(ball, VERTICAL, &ball->y_fraction, ball->dy);
    move_ball_in_axis(ball, HORIZONTAL, &ball->x_fraction, ball->dx);

    if (ball->y > GRID_HEIGHT)
    {
        ball->state = BALL_NONE;
    }

move_balls_continue:
    i++;
    goto move_balls_ball_loop;

move_balls_next_step:
    step++;
    goto move_balls_step_loop;

move_balls_end:
    return;
}

/////////////////// Subset 3 ////////////////////

// Handle all the movement of the ball in one axis (HORIZONTAL/VERTICAL)
// by `delta` amount.
void move_ball_in_axis(struct ball *ball, int axis, int *fraction, int delta)
{
    *fraction += delta;

start:
    if (*fraction < 0)
    {
        *fraction += BALL_FRACTION;
        move_ball_one_cell(ball, axis, -1);
        goto start; // Loop back to the start label
    }
    else if (*fraction >= BALL_FRACTION)
    {
        *fraction -= BALL_FRACTION;
        move_ball_one_cell(ball, axis, 1);
        goto start; // Loop back to the start label
    }

}

// Handle the actions needed when a ball collides with a brick.
void hit_brick(int row, int original_col)
{
    int brick_num = bricks[row][original_col];
    int col;

    // Destroy all the brick cells to the right.
    col = original_col;
destroy_right:
    if (col >= grid_width) goto destroy_left;
    if (bricks[row][col] != brick_num) goto destroy_left;
    bricks[row][col] = 0;
    register_screen_update(col, row);
    col++;
    goto destroy_right;

destroy_left:
    // Destroy all the brick cells to the left.
    col = original_col - 1;
destroy_left_loop:
    if (col < 0) goto update_bricks_destroyed;
    if (bricks[row][col] != brick_num) goto update_bricks_destroyed;
    bricks[row][col] = 0;
    register_screen_update(col, row);
    col--;
    goto destroy_left_loop;

update_bricks_destroyed:
    bricks_destroyed++;

    // Every 10 bricks destroyed spawn a new ball.
    if (bricks_destroyed % 10 != 0) goto end;
    if (!spawn_new_ball()) goto end;

    printf("\n!! Bonus ball !!\n");

end:
    return;
}

// Check for if movement of the paddle has caused collision
// with a ball. If so, we kick that ball upwards, give the ball
// a large horizontal velocity, and turn it into a 'SUPER_BALL'.
void check_ball_paddle_collision(void)
{
    int i = 0;

start_loop:
    if (i >= MAX_BALLS) goto end_loop;

    if (balls[i].state == BALL_NONE) goto continue_loop;
    if (balls[i].y != PADDLE_ROW) goto continue_loop;
    if (balls[i].dy < 0) goto continue_loop;
    if (balls[i].x < paddle_x) goto continue_loop;
    if (balls[i].x >= paddle_x + PADDLE_WIDTH) goto continue_loop;

    balls[i].y -= 1;
    balls[i].dy *= -1;
    balls[i].dx = BALL_FRACTION * 3 / 2;
    if (balls[i].x - paddle_x <= PADDLE_WIDTH / 2) {
        balls[i].dx *= -1;
    }
    balls[i].state = BALL_SUPER;

    // Give some score and don't reset combo_bonus to be nice.
    score += 2;

continue_loop:
    i++;
    goto start_loop;

end_loop:
    return;
}

// Handle the movement of the ball by one grid cell.
//        axis = VERTICAL, direction = -1  for up
//        axis = VERTICAL, direction =  1  for down
//      axis = HORIZONTAL, direction = -1  for left
//      axis = HORIZONTAL, direction =  1  for right
void move_ball_one_cell(struct ball *ball, int axis, int direction)
{
    register_screen_update(ball->x, ball->y);

    int *axis_position; // ball->y or ball->x
    int *axis_velocity; // ball->dy or ball->dx
    int *axis_fraction; // ball->y_fraction or ball->x_fraction

    if (axis == VERTICAL)
    {
        axis_position = &ball->y;
        axis_velocity = &ball->dy;
        axis_fraction = &ball->y_fraction;
    }
    else
    {
        axis_position = &ball->x;
        axis_velocity = &ball->dx;
        axis_fraction = &ball->x_fraction;
    }

    *axis_position += direction;

    int hit = FALSE;

    // Next, check all the possible cases for what the ball could collide with.

    if (*axis_position < 0) goto collision_wall;

    if (axis == HORIZONTAL && *axis_position >= grid_width) goto collision_wall;

    if (ball->y == PADDLE_ROW) goto collision_paddle;

    if (ball->y < GRID_HEIGHT && bricks[ball->y][ball->x]) goto collision_brick;

    goto no_collision;

collision_wall:
    hit = TRUE;
    goto collision_handling;

collision_paddle:
    hit = paddle_x <= ball->x && ball->x < paddle_x + PADDLE_WIDTH;
    if (hit && axis == HORIZONTAL && ball->dy > 0)
    {
        ball->dy *= -1;
    }
    else if (hit && axis == VERTICAL)
    {
        if (ball->x < paddle_x + PADDLE_WIDTH / 2)
        {
            ball->dx -= 3;
        }
        else
        {
            ball->dx += 3;
        }

        int max_speed = BALL_FRACTION / BALL_SIM_STEPS;
        if (ball->dx < -max_speed)
        {
            ball->dx = -max_speed;
        }
        else if (ball->dx > max_speed)
        {
            ball->dx = max_speed;
        }
    }
    combo_bonus = 0;
    goto collision_handling;

collision_brick:
    hit = ball->state != BALL_SUPER;
    hit_brick(ball->y, ball->x);

    score += 5 * (combo_bonus + 1);
    combo_bonus++;
    goto collision_handling;

no_collision:
    register_screen_update(ball->x, ball->y);
    return;

collision_handling:
    if (hit)
    {
        ball->state = BALL_NORMAL;
        *axis_fraction = (BALL_FRACTION - 1) - *axis_fraction;
        *axis_position -= direction;
        *axis_velocity *= -1;
    }

    register_screen_update(ball->x, ball->y);
}

/////////////////// Provided ////////////////////

// Read in and run a single command
int run_command(void)
{
    printf(" >> ");
    char command;

    // Note that in the provided code we don't check for EOF,
    // you don't need to worry about this difference.
    if (scanf(" %c", &command) != 1)
    {
        exit(1);
    }

    if (command == 'a')
    {
        move_paddle(-1);
    }
    else if (command == 'd')
    {
        move_paddle(1);
    }
    else if (command == 'A')
    {
        move_paddle(-1);
        move_paddle(-1);
        move_paddle(-1);
    }
    else if (command == 'D')
    {
        move_paddle(1);
        move_paddle(1);
        move_paddle(1);
    }
    else if (command == '.')
    {
        move_balls(BALL_SIM_STEPS);
    }
    else if (command == ';')
    {
        move_balls(BALL_SIM_STEPS * 3);
    }
    else if (command == ',')
    {
        move_balls(1);
    }
    else if (command == '?')
    {
        print_debug_info();
    }
    else if (command == 's')
    {
        print_screen_updates();
    }
    else if (command == 'h')
    {
        print_welcome();
    }
    else if (command == 'p')
    {
        no_auto_print = TRUE;
        print_game();
    }
    else if (command == 'q')
    {
        exit(0);
    }
    else
    {
        printf("Bad command: '%c'. Run `h` for help.\n", command);
        return FALSE;
    }

    return TRUE;
}

// Print out almost all of the current game state, useful for
// debugging.
void print_debug_info(void)
{
    printf("      grid_width = %d\n", grid_width);
    printf("        paddle_x = %d\n", paddle_x);
    printf("bricks_destroyed = %d\n", bricks_destroyed);
    printf("    total_bricks = %d\n", total_bricks);
    printf("           score = %d\n", score);
    printf("     combo_bonus = %d\n\n", combo_bonus);
    printf("        num_screen_updates = %d\n", num_screen_updates);
    printf("whole_screen_update_needed = %d\n\n", whole_screen_update_needed);

    for (int i = 0; i < MAX_BALLS; i++)
    {
        printf("ball[%d]:\n", i);
        struct ball *ball = &balls[i];
        printf("  y: %d, x: %d\n", ball->y, ball->x);
        printf("  x_fraction: %d\n", ball->x_fraction);
        printf("  y_fraction: %d\n", ball->y_fraction);
        printf("  dy: %d, dx: %d\n", ball->dy, ball->dx);
        printf("  state: %d (%c)\n", ball->state, ball->state);
    }

    for (int row = 0; row < GRID_HEIGHT; row++)
    {
        printf("\nbricks[%d]: ", row);
        for (int col = 0; col < grid_width; col++)
        {
            printf("%d ", bricks[row][col]);
        }
    }
    putchar('\n');
}

// Print out all the changes to the screen since the last call
// to `print_screen_updates`. This is used by the play-breakout
// wrapper script, which adds colour, amongst other things.
void print_screen_updates(void)
{
    putchar('&');
    printf("%d", score);

    if (whole_screen_update_needed)
    {
        for (int row = 0; row < GRID_HEIGHT; row++)
        {
            for (int col = 0; col < grid_width; col++)
            {
                printf(" %d %d %d", row, col, print_cell(row, col));
            }
        }
    }
    else
    {
        for (int i = 0; i < num_screen_updates; i++)
        {
            int y = screen_updates[i].y;
            int x = screen_updates[i].x;

            if (y >= GRID_HEIGHT || x < 0 || x >= MAX_GRID_WIDTH)
            {
                continue;
            }

            printf(" %d %d %d", y, x, print_cell(y, x));
        }
    }

    putchar('\n');
    whole_screen_update_needed = FALSE;
    num_screen_updates = 0;
}
