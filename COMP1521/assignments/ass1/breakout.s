########################################################################
# COMP1521 24T2 -- Assignment 1 -- Breakout!
#
#
# !!! IMPORTANT !!!
# Before starting work on the assignment, make sure you set your tab-width to 8!
# It is also suggested to indent with tabs only.
# Instructions to configure your text editor can be found here:
#   https://cgi.cse.unsw.edu.au/~cs1521/24T2/resources/mips-editors.html
# !!! IMPORTANT !!!
#
#
# This program was written by Daryl Chua Woon Tat z5518351
# on 26/6/2024
# Mips implementation of the game breakout
#
# Version 1.0 (2024-06-11): Team COMP1521 <cs1521@cse.unsw.edu.au>
#
########################################################################

#![tabsize(8)]

# ##########################################################
# ####################### Constants ########################
# ##########################################################

# C constants
FALSE = 0
TRUE  = 1

MAX_GRID_WIDTH = 60
MIN_GRID_WIDTH = 6
GRID_HEIGHT    = 12

BRICK_ROW_START = 2
BRICK_ROW_END   = 7
BRICK_WIDTH     = 3
PADDLE_WIDTH    = 6
PADDLE_ROW      = GRID_HEIGHT - 1

BALL_FRACTION  = 24
BALL_SIM_STEPS = 3
MAX_BALLS      = 3
BALL_NONE      = 'X'
BALL_NORMAL    = 'N'
BALL_SUPER     = 'S'

VERTICAL       = 0
HORIZONTAL     = 1

MAX_SCREEN_UPDATES = 24

KEY_LEFT        = 'a'
KEY_RIGHT       = 'd'
KEY_SUPER_LEFT  = 'A'
KEY_SUPER_RIGHT = 'D'
KEY_STEP        = '.'
KEY_BIG_STEP    = ';'
KEY_SMALL_STEP  = ','
KEY_DEBUG_INFO  = '?'
KEY_SCREEN_UPD  = 's'
KEY_HELP        = 'h'

# NULL is defined in <stdlib.h>
NULL  = 0

# Other useful constants
SIZEOF_CHAR = 1
SIZEOF_INT  = 4

BALL_X_OFFSET      = 0
BALL_Y_OFFSET      = 4
BALL_X_FRAC_OFFSET = 8
BALL_Y_FRAC_OFFSET = 12
BALL_DX_OFFSET     = 16
BALL_DY_OFFSET     = 20
BALL_STATE_OFFSET  = 24
# <implicit 3 bytes of padding>
SIZEOF_BALL = 28

SCREEN_UPDATE_X_OFFSET = 0
SCREEN_UPDATE_Y_OFFSET = 4
SIZEOF_SCREEN_UPDATE   = 8

MANY_BALL_CHAR = '#'
ONE_BALL_CHAR  = '*'
PADDLE_CHAR    = '-'
EMPTY_CHAR     = ' '
GRID_TOP_CHAR  = '='
GRID_SIDE_CHAR = '|'

	.data
# ##########################################################
# #################### Global variables ####################
# ##########################################################

# !!! DO NOT ADD, REMOVE, OR MODIFY ANY OF THESE DEFINITIONS !!!

grid_width:			# int grid_width;
	.word	0

balls:				# struct ball balls[MAX_BALLS];
	.byte	0:MAX_BALLS*SIZEOF_BALL

bricks:				# char bricks[GRID_HEIGHT][MAX_GRID_WIDTH];
	.byte	0:GRID_HEIGHT*MAX_GRID_WIDTH

bricks_destroyed:		# int bricks_destroyed;
	.word	0

total_bricks:			# int total_bricks;
	.word	0

paddle_x:			# int paddle_x;
	.word	0

score:				# int score;
	.word	0

combo_bonus:			# int combo_bonus;
	.word	0

screen_updates:			# struct screen_update screen_updates[MAX_SCREEN_UPDATES];
	.byte	0:MAX_SCREEN_UPDATES*SIZEOF_SCREEN_UPDATE

num_screen_updates:		# int num_screen_updates;
	.word	0

whole_screen_update_needed:	# int whole_screen_update_needed;
	.word	0

no_auto_print:			# int no_auto_print;
	.word	0


# ##########################################################
# ######################### Strings ########################
# ##########################################################

# !!! DO NOT ADD, REMOVE, OR MODIFY ANY OF THESE STRINGS !!!

str_print_welcome_1:
	.asciiz	"Welcome to 1521 breakout! In this game you control a "
str_print_welcome_2:
	.asciiz	"paddle (---) with\nthe "
str_print_welcome_3:	# note: this string is used twice
	.asciiz	" and "
str_print_welcome_4:
	.asciiz	" (or "
str_print_welcome_5:
	.asciiz	" for fast "
str_print_welcome_6:
	.asciiz	"movement) keys, and your goal is\nto bounce the ball ("
str_print_welcome_7:
	.asciiz	") off of the bricks (digits). Every ten "
str_print_welcome_8:
	.asciiz	"bricks\ndestroyed spawns an extra ball. The "
str_print_welcome_9:
	.asciiz	" key will advance time one step.\n\n"

str_read_grid_width_prompt:
	.asciiz	"Enter the width of the playing field: "
str_read_grid_width_out_of_bounds_1:
	.asciiz	"Bad input, the width must be between "
str_read_grid_width_out_of_bounds_2:
	.asciiz	" and "
str_read_grid_width_not_multiple:
	.asciiz	"Bad input, the grid width must be a multiple of "

str_game_loop_win:
	.asciiz	"\nYou win! Congratulations!\n"
str_game_loop_game_over:
	.asciiz	"Game over :(\n"
str_game_loop_final_score:
	.asciiz	"Final score: "

str_print_game_score:
	.asciiz	" SCORE: "

str_hit_brick_bonus_ball:
	.asciiz	"\n!! Bonus ball !!\n"

str_run_command_prompt:
	.asciiz	" >> "
str_run_command_bad_cmd_1:
	.asciiz	"Bad command: '"
str_run_command_bad_cmd_2:
	.asciiz	"'. Run `h` for help.\n"

str_print_debug_info_1:
	.asciiz	"      grid_width = "
str_print_debug_info_2:
	.asciiz	"        paddle_x = "
str_print_debug_info_3:
	.asciiz	"bricks_destroyed = "
str_print_debug_info_4:
	.asciiz	"    total_bricks = "
str_print_debug_info_5:
	.asciiz	"           score = "
str_print_debug_info_6:
	.asciiz	"     combo_bonus = "
str_print_debug_info_7:
	.asciiz	"        num_screen_updates = "
str_print_debug_info_8:
	.asciiz	"whole_screen_update_needed = "
str_print_debug_info_9:
	.asciiz	"ball["
str_print_debug_info_10:
	.asciiz	"  y: "
str_print_debug_info_11:
	.asciiz	", x: "
str_print_debug_info_12:
	.asciiz	"  x_fraction: "
str_print_debug_info_13:
	.asciiz	"  y_fraction: "
str_print_debug_info_14:
	.asciiz	"  dy: "
str_print_debug_info_15:
	.asciiz	", dx: "
str_print_debug_info_16:
	.asciiz	"  state: "
str_print_debug_info_17:
	.asciiz	" ("
str_print_debug_info_18:
	.asciiz	")\n"
str_print_debug_info_19:
	.asciiz	"\nbricks["
str_print_debug_info_20:
	.asciiz	"]: "
str_print_debug_info_21:
	.asciiz	"]:\n"

# !!! Reminder to not not add to or modify any of the above !!!
# !!! strings or any other part of the data segment.        !!!
# !!! If you add more strings you will likely break the     !!!
# !!! autotests and automarking.                            !!!


############################################################
####                                                    ####
####   Your journey begins here, intrepid adventurer!   ####
####                                                    ####
############################################################

################################################################################
#
# Implement the following functions,
# and check these boxes as you finish implementing each function.
#
#  SUBSET 0
#  - [ x ] print_welcome
#  - [ x ] main
#  SUBSET 1
#  - [ x ] read_grid_width
#  - [ x ] game_loop
#  - [ x ] initialise_game
#  - [ x ] move_paddle
#  - [ x ] count_total_active_balls
#  - [ x ] print_cell
#  SUBSET 2
#  - [ x ] register_screen_update
#  - [ x ] count_balls_at_coordinate
#  - [ x ] print_game
#  - [ x ] spawn_new_ball
#  - [ x ] move_balls
#  SUBSET 3
#  - [ x ] move_ball_in_axis
#  - [ x ] hit_brick
#  - [ x ] check_ball_paddle_collision
#  - [ x ] move_ball_one_cell
#  PROVIDED
#  - [X] print_debug_info
#  - [X] run_command
#  - [X] print_screen_updates

################################################################################
# Print out information on how to play this game.
# .TEXT <print_welcome>
        .text
print_welcome:
	# Subset:   0
	#
	# Frame:    [none]
	# Uses:     [$a0, $v0, $ra]
	# Clobbers: [$a0, $v0]
	#
	# Locals:
	#   - None
	#
	# Structure:
	#   print_welcome
	#   -> [prologue]
	#       -> body
	#   -> [epilogue]

print_welcome__prologue:
	begin
	push	$ra
print_welcome__body:
	# Print "Welcome to 1521 breakout! In this game you control a "
	la	$a0, str_print_welcome_1
	li	$v0, 4
	syscall

	# Print "paddle (---) with\nthe "
	la	$a0, str_print_welcome_2
	li	$v0, 4
	syscall

	# Print KEY_LEFT
	li	$a0, KEY_LEFT
	li	$v0, 11
	syscall

	# Print " and "
	la	$a0, str_print_welcome_3
	li	$v0, 4
	syscall

	# Print KEY_RIGHT
	li	$a0, KEY_RIGHT
	li	$v0, 11
	syscall

	# Print " (or "
	la	$a0, str_print_welcome_4
	li	$v0, 4
	syscall

	# Print KEY_SUPER_LEFT
	li	$a0, KEY_SUPER_LEFT
	li	$v0, 11
	syscall

	# Print " and "
	la	$a0, str_print_welcome_3
	li	$v0, 4
	syscall

	# Print KEY_SUPER_RIGHT
	li	$a0, KEY_SUPER_RIGHT
	li	$v0, 11
	syscall

	# Print "for fast:
	la	$a0, str_print_welcome_5
	li	$v0, 4
	syscall

	# Print "movement) keys, and your goal is\nto bounce the ball ("
	la	$a0, str_print_welcome_6
	li	$v0, 4
	syscall

	# Print ONE_BALL_CHAR
	li	$a0, ONE_BALL_CHAR
	li	$v0, 11
	syscall

	# Print ") off of the bricks (digits). Every ten "
	la	$a0, str_print_welcome_7
	li	$v0, 4
	syscall

	# Print "bricks\ndestroyed spawns an extra ball. The "
	la	$a0, str_print_welcome_8
	li	$v0, 4
	syscall

	# Print KEY_STEP
	li	$a0, KEY_STEP
	li	$v0, 11
	syscall

	# Print "key will advance time one step.\n\n"
	la	$a0, str_print_welcome_9
	li	$v0, 4
	syscall

print_welcome__epilogue:
	pop	$ra
	end
	jr      $ra



################################################################################
# Entry point to the game.
# .TEXT <main>
        .text
main:
	# Subset:   0
	#
	# Frame:    [none]
	# Uses:     [$a0, $v0, $ra]
	# Clobbers: [$a0, $v0, $t0, $t1, $t2]
	#
	# Locals:
	#   - None
	#
	# Structure:
	#   main
	#   -> [prologue]
	#       -> body
	#   -> [epilogue]

main__prologue:
	# Save the return address
	begin
	push 	$ra

main__body:
	# Call print_welcome
	jal print_welcome

	# Call read_grid_width
	jal read_grid_width

	# Call initialise_game
	jal initialise_game

	# Call game_loop
	jal game_loop

main__epilogue:
	# Restore the return address
	pop 	$ra
	end
	# Return from main
	li 	$v0, 0
	jr 	$ra


################################################################################
# Read in and validate the grid width.
# .TEXT <read_grid_width>
        .text
read_grid_width:
	# Subset:   1
	#
	# Frame:    [$ra]
	# Uses:     [$ra, $a0, $v0, $t0, $t4, $t5]
	# Clobbers: [$a0, $v0, $t0, $t4, $t5]
	#
	# Locals:
	#   - $t5: flag to determine if input is valid
	#
	# Structure:
	#   read_grid_width
	#   -> [prologue]
	#   -> [body]
	#	-> [start_loop]
	#	-> [print_out_of_range]
	#	-> [print_not_multiple]
	#	-> [end_loop]
	#   -> [epilogue]

read_grid_width__prologue:
	begin
	push	$ra
	li	$t5, 0          # done = 0
read_grid_width__body:
read_grid_width_start_loop:
	bnez	$t5, read_grid_width_end_loop # if (done) goto end_loop
	la	$a0, str_read_grid_width_prompt # printf("Enter the width of the playing field: ");
	li	$v0, 4
	syscall

	li	$v0, 5         # scanf("%d", &grid_width);
	syscall
	sw	$v0, grid_width
	lw	$t0, grid_width

	blt	$t0, MIN_GRID_WIDTH, read_grid_width_print_out_of_range # if (grid_width < MIN_GRID_WIDTH)
	bgt	$t0, MAX_GRID_WIDTH, read_grid_width_print_out_of_range # if (grid_width > MAX_GRID_WIDTH)

	rem	$t4, $t0, BRICK_WIDTH # if (grid_width % BRICK_WIDTH != 0)
	bnez 	$t4, read_grid_width_print_not_multiple

	li	$t5, 1       # done = 1
	j 	read_grid_width_end_loop

read_grid_width_print_out_of_range:
	la	$a0, str_read_grid_width_out_of_bounds_1 # printf("Bad input, the width must be between %d and %d\n", MIN_GRID_WIDTH, MAX_GRID_WIDTH);
	li	$v0, 4
	syscall

	li	$a0, MIN_GRID_WIDTH
	li	$v0, 1
	syscall

	la	$a0, str_read_grid_width_out_of_bounds_2
	li	$v0, 4
	syscall

	li	$a0, MAX_GRID_WIDTH
	li	$v0, 1
	syscall

	li	$v0, 11
	li	$a0, '\n'
	syscall	

	j read_grid_width_start_loop # goto start_loop

read_grid_width_print_not_multiple:
	la	$a0, str_read_grid_width_not_multiple # printf("Bad input, the grid width must be a multiple of %d\n", BRICK_WIDTH);
	li	$v0, 4
	syscall

	li	$a0, BRICK_WIDTH
	li	$v0, 1
	syscall

	li	$v0, 11
	li	$a0, '\n'
	syscall	

	j read_grid_width_start_loop # goto start_loop

read_grid_width_end_loop:
	li	$v0, 11
	li	$a0, '\n'
	syscall	
read_grid_width__epilogue:
	pop	$ra
	end
	jr	$ra
################################################################################
# Run the game loop: print out the game and read in and execute commands
# until the game is over.
# .TEXT <game_loop>
        .text
game_loop:
	# Subset:   1
	#
	# Frame:    [$ra]
	# Uses:     [$ra, $t0, $t1, $t2, $t3]
	# Clobbers: [$t0, $t1, $t2, $t3]
	#
	# Locals:
	#   - None
	#
	# Structure:
	#   game_loop
	#   -> [prologue]
	#   -> [body]
	#	-> [start_game]
	#	-> [run_command_loop]
	#	-> [check_win]
	#	-> [win]
	#	-> [lose]
	#	-> [print_score]
	#   -> [epilogue]

game_loop__prologue:
	begin
	push	$ra
game_loop__body:
game_loop_start_game:
        lw      $t0, bricks_destroyed # if (bricks_destroyed >= total_bricks)
        lw      $t1, total_bricks
        bge     $t0, $t1, game_loop_check_win

        jal     count_total_active_balls # if (count_total_active_balls() <= 0)
        move    $t2, $v0
        blez    $t2, game_loop_check_win

        lw      $t3, no_auto_print # if (!no_auto_print)
        bnez    $t3, game_loop_run_command_loop

        jal     print_game # print_game()

game_loop_run_command_loop:
        jal     run_command # run_command()
        beqz    $v0, game_loop_run_command_loop

        j       game_loop_start_game # goto start_game

game_loop_check_win:
        lw      $t0, bricks_destroyed # if (bricks_destroyed == total_bricks)
        lw      $t1, total_bricks
        bne     $t0, $t1, game_loop_lose # goto lose

game_loop_win:
        la      $a0, str_game_loop_win # printf("\nYou win! Congratulations!\n");
        li      $v0, 4
        syscall

        j       print_score # goto print_score

game_loop_lose:
        la      $a0, str_game_loop_game_over # printf("Game over :(\n");
        li      $v0, 4
        syscall

print_score:
        la      $a0, str_game_loop_final_score # printf("Final score: %d\n", score);
        lw      $a1, score
        li      $v0, 4
        syscall

        move    $a0, $a1
        li      $v0, 1
        syscall

        # Print a newline after final score
        li      $a0, '\n'
        li      $v0, 11
        syscall

game_loop__epilogue:
	pop	$ra
	end
	jr	$ra


################################################################################
# Initialise the game state ready for a new game. 
# .TEXT <initialise_game>
        .text
initialise_game:
	# Subset:   1
	#
	# Frame:    [...]   <-- FILL THESE OUT!
	# Uses:     [...]
	# Clobbers: [...]
	#
	# Locals:           <-- FILL THIS OUT!
	#   - ...
	#
	# Structure:        <-- FILL THIS OUT!
	#   initialise_game
	#   -> [prologue]
	#       -> body
	#   -> [epilogue]

initialise_game__prologue:
	begin
	push	$ra
	push	$s0
	push	$s1
	push	$s2
	push	$s3
	push	$s4
	push	$s5	
initialise_game__body:
    	li      $s0, 0            # row = 0
    	li      $s1, 0            # col = 0
    	li      $s2, 0            # i = 0

initialise_bricks:
    	blt     $s0, GRID_HEIGHT, initialise_bricks_inner

    	li      $s0, 0            # row = 0
    	li      $s1, 0            # col = 0
    	j       initialise_balls

initialise_bricks_inner:
    	lw      $t0, grid_width
    	move    $t1, $t0          # Ensure $t1 is initialized to grid_width
    	blt     $s1, $t1, check_brick_row

    	addi    $s0, $s0, 1       # row++
    	li      $s1, 0            # col = 0
    	j       initialise_bricks

check_brick_row:
    	bge     $s0, BRICK_ROW_START, check_brick_row2
    	mul	$t0, $s0, MAX_GRID_WIDTH
	add	$t0, $t0, $s1
	li 	$t2, 0
	sb	$t2, bricks($t0)
    	j       initialise_game_increment_col

check_brick_row2:
    	ble     $s0, BRICK_ROW_END, set_brick_value
	mul	$t0, $s0, MAX_GRID_WIDTH
	add	$t0, $t0, $s1
	li 	$t2, 0
	sb	$t2, bricks($t0)
    	j       initialise_game_increment_col

set_brick_value:
    	la      $t1, bricks
    	mul     $t2, $s0, MAX_GRID_WIDTH
    	add     $t2, $t2, $s1
    	add     $t1, $t1, $t2

    	# Calculate col / BRICK_WIDTH
    	div    	$t3, $s1, BRICK_WIDTH
    	# Calculate (col / BRICK_WIDTH) % 10
    	li      $t4, 10
    	rem    	$t3, $t3, $t4
    	addi    $t3, $t3, 1       # 1 + ((col / BRICK_WIDTH) % 10)
    	sb      $t3, 0($t1)

    	j       initialise_game_increment_col

initialise_game_increment_col:
    	addi    $s1, $s1, 1       # col++
    	j       initialise_bricks_inner

initialise_balls:
    	blt     $s2, MAX_BALLS, set_ball_none
    	j       spawn_first_ball

set_ball_none:
    	la      $t2, balls        # balls[i].state = BALL_NONE
	mul     $t3, $s2, SIZEOF_BALL
	add     $t2, $t2, $t3
    	li      $t4, BALL_NONE
    	sb      $t4, BALL_STATE_OFFSET($t2)
    	addi    $s2, $s2, 1       # i++
    	j       initialise_balls

spawn_first_ball:
    	jal     spawn_new_ball
    	j       set_paddle_position
	
set_paddle_position:
    	lw      $t0, grid_width
    	sub     $t1, $t0, PADDLE_WIDTH
    	addi    $t1, $t1, 1
    	sra     $t1, $t1, 1       # paddle_x = (grid_width - PADDLE_WIDTH + 1) / 2
    	sw      $t1, paddle_x
    	j       initialise_score

initialise_score:
    	li      $t2, 0
    	sw      $t2, score        # score = 0
    	sw      $t2, bricks_destroyed  # bricks_destroyed = 0
    	j       calculate_total_bricks

calculate_total_bricks:
    	li      $t3, BRICK_ROW_END
    	sub     $t3, $t3, BRICK_ROW_START
    	addi    $t3, $t3, 1
    	lw      $t4, grid_width
    	div     $t4, $t4, BRICK_WIDTH
    	mul     $t5, $t3, $t4
    	sw      $t5, total_bricks
    	j       final_initialisation

final_initialisation:
    	li      $t6, 0
    	sw      $t6, num_screen_updates
    	sw      $t6, no_auto_print
    	li      $t7, TRUE
    	sw      $t7, whole_screen_update_needed
    	j       initialise_game__epilogue

initialise_game__epilogue:
    	pop     $s5
    	pop     $s4
    	pop     $s3
    	pop     $s2
    	pop     $s1
    	pop     $s0
    	pop     $ra
    	end
    	jr      $ra

################################################################################
# Move the paddle,
# direction = 1 => right
# direction = -1 => left.
# .TEXT <move_paddle>
        .text
move_paddle:
	# Subset:   1
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3]
	# Uses:     [$a0, $v0, $t0, $t1, $t2, $t4, $t5]
	# Clobbers: [$t0, $t1, $t2, $t4, $t5]
	#
	# Locals:
	#   - $s1: direction
	#
	# Structure:
	#   move_paddle
	#   -> [prologue]
	#       -> body
	#           -> check_bounds
	#           -> reverse_direction
	#           -> check_collision
	#   -> [epilogue]

move_paddle__prologue:
	begin
	push	$ra
	push	$s0
	push	$s1
	push	$s2
	push	$s3
move_paddle__body:
	move 	$s1, $a0                # direction
	lw      $s0, paddle_x         # paddle_x += direction
	add     $s0, $s0, $s1
	sw      $s0, paddle_x

move_paddle_check_bounds:
	bltz    $s0, move_paddle_reverse_direction # if (paddle_x < 0) goto reverse_direction

	li      $t0, PADDLE_WIDTH      # if (paddle_x + PADDLE_WIDTH > grid_width)
	add     $t0, $s0, $t0
	lw      $t1, grid_width
	bgt     $t0, $t1, move_paddle_reverse_direction

	j       move_paddle_check_collision # goto check_collision

move_paddle_reverse_direction:
	sub     $s0, $s0, $s1          # paddle_x -= direction
	sw      $s0, paddle_x
	j       move_paddle__epilogue  # goto end_function

move_paddle_check_collision:
	jal     check_ball_paddle_collision # check_ball_paddle_collision()

	addi    $s2, $s1, 2            # int direction_indicator = (direction + 2) / 2
	sra     $s2, $s2, 1

	li      $s3, PADDLE_ROW        # register_screen_update(paddle_x - direction_indicator, PADDLE_ROW)
	sub     $t4, $s0, $s2
	move    $a0, $t4
	move    $a1, $s3
	jal     register_screen_update

	li      $t5, PADDLE_WIDTH      # register_screen_update(paddle_x + PADDLE_WIDTH - direction_indicator, PADDLE_ROW)
	add     $t5, $s0, $t5
	sub     $t5, $t5, $s2
	move    $a0, $t5
	move    $a1, $s3
	jal     register_screen_update

	j       move_paddle__epilogue  # goto end_function
move_paddle__epilogue:
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$s0
	pop	$ra
	end
	jr	$ra


################################################################################
# Return the total number of active balls.
# .TEXT <count_total_active_balls>
        .text
count_total_active_balls:
	# Subset:   1
	#
	# Frame:    [$ra]
	# Uses:     [$a0, $v0, $t0, $t1, $t2, $t3]
	# Clobbers: [$t0, $t1, $t2, $t3]
	#
	# Locals:
	#   - None
	#
	# Structure:
	#   count_total_active_balls
	#   -> [prologue]
	#       -> body
	#           -> start_loop
	#           -> loop_body
	#               -> increment_count
	#               -> increment_i
	#           -> end_loop
	#   -> [epilogue]

count_total_active_balls__prologue:
	begin
	push	$ra
	li	$t0, 0                  # int count = 0
	li	$t1, 0                  # int i = 0
count_total_active_balls__body:
count_total_active_balls_start_loop:
	blt     $t1, MAX_BALLS, count_total_active_balls_loop_body # if (i < MAX_BALLS) goto loop_body
	j       count_total_active_balls_loop_end           # else goto end_loop

count_total_active_balls_loop_body:
	la	$t2, balls
	mul	$t3, $t1, SIZEOF_BALL
	add	$t2, $t2, $t3
	lb      $t3, BALL_STATE_OFFSET($t2)          # Load balls[i].state

	# if (balls[i].state != BALL_NONE) goto increment_count
	bne     $t3, BALL_NONE, count_total_active_balls_increment_count 
	j       count_total_active_balls_increment_i           # else goto increment_i

count_total_active_balls_increment_count:
	addi    $t0, $t0, 1            # count++

count_total_active_balls_increment_i:
	addi    $t1, $t1, 1            # i++
	j       count_total_active_balls_start_loop         

count_total_active_balls_loop_end:
	move    $v0, $t0               # return count
count_total_active_balls__epilogue:
	pop	$ra
	end
	jr	$ra


################################################################################
# Returns the appropriate character to print, for a given coordinate in the grid.
# .TEXT <print_cell>
        .text
print_cell:
	# Subset:   1
	#
	# Frame:    [$ra, $s0, $s1]
	# Uses:     [$a0, $a1, $v0, $t0, $t1, $t2, $t3, $t4]
	# Clobbers: [$t0, $t1, $t2, $t3, $t4]
	#
	# Locals:
	#   - $s0: row
	#   - $s1: col
	#
	# Structure:
	#   print_cell
	#   -> [prologue]
	#       -> body
	#           -> check_ball_more_than_zero
	#           -> check_one_ball
	#           -> check_paddle
	#               -> check_col
	#               -> check_bricks
	#           -> return_empty_char
	#           -> return_paddle_char
	#           -> return_one_ball_char
	#           -> return_many_ball_char
	#           -> return_brick_char
	#   -> [epilogue]

print_cell__prologue:
	begin
	push	$ra
	push	$s0
	push	$s1
print_cell__body:
	move 	$s0, $a0
	move	$s1, $a1

	move	$a0, $s0            # row
	move	$a1, $s1            # col
	jal	count_balls_at_coordinate
	move	$t0, $v0            # ball_count

	j print_cell_check_ball_more_than_zero

print_cell_check_ball_more_than_zero:
	li	$t1, 1              # if (ball_count > 1)
	bgt	$t0, $t1, print_cell_return_many_ball_char
	j	print_cell_check_one_ball

print_cell_check_one_ball:
	beq	$t0, $t1, print_cell_return_one_ball_char
	j print_cell_check_paddle

print_cell_check_paddle:
	li	$t2, PADDLE_ROW
	beq	$s0, $t2, print_cell_check_col
	j print_cell_check_bricks

print_cell_check_col:
	lw	$t3, paddle_x
	ble	$t3, $s1, print_cell_check_col_end
	j print_cell_check_bricks

print_cell_check_bricks:
	mul	$t0, $s0, MAX_GRID_WIDTH
	add	$t0, $t0, $s1
	lb	$t0, bricks($t0)

	bnez	$t0, print_cell_return_brick_char

	j	print_cell_return_empty_char

print_cell_check_col_end:
	addi	$t4, $t3, PADDLE_WIDTH
	blt	$s1, $t4, print_cell_return_paddle_char
	j 	print_cell_check_bricks

print_cell_return_empty_char:
	li	$v0, EMPTY_CHAR
	j 	print_cell__epilogue
print_cell_return_paddle_char:
	li	$v0, PADDLE_CHAR
	j 	print_cell__epilogue
print_cell_return_one_ball_char:
	li	$v0, ONE_BALL_CHAR
	j 	print_cell__epilogue
print_cell_return_many_ball_char:
	li	$v0, MANY_BALL_CHAR
	j 	print_cell__epilogue

print_cell_return_brick_char:
	mul	$t0, $s0, MAX_GRID_WIDTH
	add	$t0, $t0, $s1
	lb	$t0, bricks($t0)
	sub	$t0, $t0, 1

	addi	$t0, $t0, '0'

	move	$v0, $t0
	j print_cell__epilogue

print_cell__epilogue:
	pop	$s1
	pop	$s0
	pop	$ra
	end
	jr	$ra


################################################################################
# Adds a new coordiante to the list of (potentially) changed parts of the screen.
# .TEXT <register_screen_update>
        .text
register_screen_update:
	# Subset:   2
	#
	# Frame:    [$ra]
	# Uses:     [$a0, $a1, $t0, $t1, $t3, $t4]
	# Clobbers: [$t0, $t1, $t3, $t4]
	#
	# Locals:   - None
	#
	# Structure:
	#   register_screen_update
	#   -> [prologue]
	#       -> body
	#           -> set_whole_screen_update
	#   -> [epilogue]

register_screen_update__prologue:
	begin
	push	$ra
register_screen_update__body:
	# if (whole_screen_update_needed)
	lw	$t0, whole_screen_update_needed       
	bne	$t0, $zero, register_screen_update__epilogue # goto end

	# if (num_screen_updates >= MAX_SCREEN_UPDATES)
	lw	$t1, num_screen_updates                
	bge	$t1, MAX_SCREEN_UPDATES, set_whole_screen_update # goto set_whole_screen_update

	# screen_updates[num_screen_updates].x = x
	# screen_updates[num_screen_updates].y = y
	la	$t4, screen_updates                   
	mul	$t3, $t1, SIZEOF_SCREEN_UPDATE
	add	$t4, $t4, $t3
	sw	$a0, SCREEN_UPDATE_X_OFFSET($t4)
	sw	$a1, SCREEN_UPDATE_Y_OFFSET($t4)
	addi	$t1, $t1, 1                          # num_screen_updates++
	sw	$t1, num_screen_updates

	j register_screen_update__epilogue       

set_whole_screen_update:
	# whole_screen_update_needed = TRUE
	li	$t0, 1                               
	sw	$t0, whole_screen_update_needed

register_screen_update__epilogue:
	pop	$ra
	end
	jr	$ra


################################################################################
# Returns the total number of balls at a given coordiante in the grid.
# .TEXT <count_balls_at_coordinate>
        .text
count_balls_at_coordinate:
	# Subset:   2
	#
	# Frame:    [$ra]
	# Uses:     [$a0, $a1, $v0, $t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7]
	# Clobbers: [$t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7]
	#
	# Locals:   - None
	#
	# Structure:
	#   count_balls_at_coordinate
	#   -> [prologue]
	#       -> body
	#           -> start_loop
	#           -> loop_body
	#               -> check_coords
	#               -> increment_i
	#           -> end
	#   -> [epilogue]

count_balls_at_coordinate__prologue:
	begin
	push	$ra
count_balls_at_coordinate__body:
	# count = 0
	li	$t0, 0              
	# i = 0
	li	$t1, 0              

	# load address of balls array
	la	$t2, balls          

	j count_balls_at_coordinate_start_loop

count_balls_at_coordinate_start_loop:
	# if (i < MAX_BALLS) goto loop_body
	blt 	$t1, MAX_BALLS, count_balls_at_coordinate_loop_body 
	# else goto end
	j	count_balls_at_coordinate_end      

count_balls_at_coordinate_loop_body:
	# load balls[i].state
	mul	$t3, $t1, SIZEOF_BALL
	add	$t4, $t2, $t3
	lb	$t5, BALL_STATE_OFFSET($t4)        

	# if (balls[i].state != BALL_NONE) goto check_coords
	bne	$t5, BALL_NONE, check_coords       
	# else goto next_iteration
	j 	count_balls_at_coordinate_increment_i 

check_coords:
	# if (balls[i].y != row) goto next_iteration
	lw	$t6, BALL_Y_OFFSET($t4)           
	bne	$t6, $a0, count_balls_at_coordinate_increment_i

	# if (balls[i].x != col) goto next_iteration
	lw	$t7, BALL_X_OFFSET($t4)            
	bne	$t7, $a1, count_balls_at_coordinate_increment_i

	# count++
	addi	$t0, $t0, 1

count_balls_at_coordinate_increment_i:
	# i++
	addi	$t1, $t1, 1
	j count_balls_at_coordinate_start_loop

count_balls_at_coordinate_end:
	move	$v0, $t0
count_balls_at_coordinate__epilogue:
	pop	$ra
	end
	jr	$ra

################################################################################
# Print out the full grid, as well as the current score. 
# .TEXT <print_game>
        .text
print_game:
	# Subset:   2
	#
	# Frame:    [$ra, $s0, $s1, $s2]
	# Uses:     [$a0, $a1, $v0, $s0, $s1, $s2, $t0, $t1]
	# Clobbers: [$t0, $t1]
	#
	# Locals:   - None
	#
	# Structure:
	#   print_game
	#   -> [prologue]
	#       -> body
	#           -> row_loop_start
	#               -> col_loop_start
	#                   -> print_top_char
	#                   -> print_side_char
	#                   -> increment_col
	#               -> next_row
	#           -> row_loop_end
	#   -> [epilogue]

print_game__prologue:
	begin
	push	$ra
	push	$s0
	push 	$s1
	push	$s2
print_game__body:
	# row = -1
	li	$s0, -1		
	# col = -1
	li	$s1, -1		
	lw	$s2, grid_width

	# Print the score
	la      $a0, str_print_game_score
	li      $v0, 4          
	syscall
	lw      $a0, score
	li      $v0, 1          
	syscall
	li      $a0, '\n'
	li      $v0, 11         
	syscall
    
    # Row loop start
print_game_row_loop_start:
	bge     $s0, GRID_HEIGHT, print_game_row_loop_end
	# Reset col to -1 for each row
	li      $s1, -1         
    
print_game_col_loop_start:
	bgt     $s1, $s2, print_game_next_row
	beq     $s0, -1, print_game_print_top_char
	beq     $s1, -1, print_game_print_side_char
	beq     $s1, $s2, print_game_print_side_char
	move    $a0, $s0
	move    $a1, $s1
	jal     print_cell
	move    $a0, $v0
	li      $v0, 11         
	syscall
	j       print_game_increment_col
    
print_game_print_top_char:
	# putchar(GRID_TOP_CHAR);
	li      $a0, GRID_TOP_CHAR
	li      $v0, 11         
	syscall
	j       print_game_increment_col

print_game_print_side_char:
	# putchar(GRID_SIDE_CHAR)
	li      $a0, GRID_SIDE_CHAR
	li      $v0, 11         
	syscall

print_game_increment_col:
	# col++
	addi    $s1, $s1, 1
	j       print_game_col_loop_start

print_game_next_row:
	# putchar('\n')
	li      $a0, '\n'
	li      $v0, 11          
	syscall
	# row++
	addi    $s0, $s0, 1
	j       print_game_row_loop_start

print_game_row_loop_end:
	j print_game__epilogue

print_game__epilogue:
	pop	$s2
	pop	$s1
	pop	$s0
	pop	$ra
	end
	jr	$ra


################################################################################
# Add a new ball to the 'balls' array. Returns TRUE if there was an unused slot
# and FALSE if there wasn't, so no ball could be created. 
# .TEXT <spawn_new_ball>
        .text
spawn_new_ball:
	# Subset:   2
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3]
	# Uses:     [$a0, $a1, $v0, $t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8, $t9]
	# Clobbers: [$t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8, $t9]
	#
	# Locals:   - None
	#
	# Structure:
	#   spawn_new_ball
	#   -> [prologue]
	#       -> body
	#           -> find_new_ball
	#           -> no_new_ball
	#           -> ball_found
	#           -> spawn_new_ball_flip_direction
	#           -> spawn_new_ball_end
	#   -> [epilogue]

spawn_new_ball__prologue:
	begin
	push	$ra
	push	$s0
	push	$s1
	push	$s2
	push	$s3
spawn_new_ball__body:
	# new_ball = NULL
	li	$s0, NULL			
	# i = 0
	li	$s1, 0				

find_new_ball:
	# if (i >= MAX_BALLS) goto no_new_ball
	bge 	$s1, MAX_BALLS, no_new_ball	
	la	$t0, balls
	mul	$t1, $s1, SIZEOF_BALL
	add	$t0, $t0, $t1
	# if (balls[i].state == BALL_NONE) goto ball_found
	lb	$t2, BALL_STATE_OFFSET($t0)	
	beq	$t2, BALL_NONE, ball_found	

	# i++;
	addi	$s1, $s1, 1			
	# goto find_new_ball
	j	find_new_ball			

no_new_ball:
	li	$v0, FALSE			

	j	spawn_new_ball__epilogue

ball_found:
	# new_ball = &balls[i]
	move	$s0, $t0		

	# new_ball->state = BALL_NORMAL
	li	$t3, BALL_NORMAL
	sb	$t3, BALL_STATE_OFFSET($s0)	

	# new_ball->x = grid_width / 2
	lw	$t4, grid_width
	div	$t4, $t4, 2
	sw	$t4, BALL_X_OFFSET($s0)		

	# new_ball->y = PADDLE_ROW - 1
	li	$t5, PADDLE_ROW
	sub	$t5, $t5, 1
	sw	$t5, BALL_Y_OFFSET($s0)		

	# new_ball->x_fraction = BALL_FRACTION / 2
	# new_ball->y_fraction = BALL_FRACTION / 2
	li	$t6, BALL_FRACTION
	div	$t6, $t6, 2
	sw	$t6, BALL_X_FRAC_OFFSET($s0)	
	sw	$t6, BALL_Y_FRAC_OFFSET($s0)	

	# new_ball->dy = -BALL_FRACTION / BALL_SIM_STEPS
	li	$t7, BALL_FRACTION
	div	$t7, $t7, BALL_SIM_STEPS
	neg 	$t7, $t7
	sw	$t7, BALL_DY_OFFSET($s0)	

	# new_ball->dx = BALL_FRACTION / BALL_SIM_STEPS / 4
	li	$t8, BALL_FRACTION
	div	$t8, $t8, BALL_SIM_STEPS
	div	$t8, $t8, 4
	sw	$t8, BALL_DX_OFFSET($s0)	

	# if (grid_width % 2 == 0) new_ball->dx *= -1
	lw	$t9, grid_width
	andi	$t9, $t9, 1
	beqz	$t9, spawn_new_ball_flip_direction
	j	spawn_new_ball_end

spawn_new_ball_flip_direction:
	# new_ball->dx *= -1
	neg	$t8, $t8
	sw	$t8, BALL_DX_OFFSET($s0)	

spawn_new_ball_end:
	# Register the screen update for the new ball
	lw	$a0, BALL_X_OFFSET($s0)
	lw	$a1, BALL_Y_OFFSET($s0)
	jal	register_screen_update

	# return TRUE;
	li	$v0, TRUE			

spawn_new_ball__epilogue:
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$s0
	pop	$ra
	end
	jr	$ra



################################################################################
# Handle the movement of all balls in both axis for 'sim_steps' steps.
# .TEXT <move_balls>
        .text
move_balls:
	# Subset:   2
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3, $s4]
	# Uses:     [$a0, $v0, $t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7]
	# Clobbers: [$t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7]
	#
	# Locals:   - None
	#
	# Structure:
	#   move_balls
	#   -> [prologue]
	#       -> body
	#           -> move_balls_step_loop
	#           -> move_balls_ball_loop
	#           -> move_balls_continue
	#           -> move_balls_set_ball_none
	#           -> move_balls_next_step
	#           -> move_balls_end
	#   -> [epilogue]

move_balls__prologue:
	begin
	push	$ra
	push	$s0
	push	$s1
	push	$s2
	push	$s3
	push	$s4

move_balls__body:
	# step = 0
	li	$s0, 0
	# i = 0
	li	$s1, 0
	# ball = NULL
	li	$s2, NULL
	# move_balls(sim_steps)
	move	$s4, $a0

	j 	move_balls_step_loop

move_balls_step_loop:
	# if (step >= sim_steps) goto move_balls_end
	bge	$s0, $s4, move_balls_end
	# i = 0
	li	$s1, 0

	j 	move_balls_ball_loop

move_balls_ball_loop:
	# if (i >= MAX_BALLS) goto move_balls_next_step
	bge	$s1, MAX_BALLS, move_balls_next_step
	la	$t0, balls
	mul	$t1, $s1, SIZEOF_BALL
	# ball = &balls[i]
	add	$s2, $t0, $t1

	# if (ball->state == BALL_NONE) goto move_balls_continue
	lb	$t2, BALL_STATE_OFFSET($s2)
	beq	$t2, BALL_NONE, move_balls_continue

	# move_ball_in_axis(ball, VERTICAL, &ball->y_fraction, ball->dy)
    	move    $a0, $s2
    	# VERTICAL
    	li      $a1, VERTICAL
    	# &ball->y_fraction
    	la      $a2, BALL_Y_FRAC_OFFSET($s2)
    	# ball->dy
    	lw      $a3, BALL_DY_OFFSET($s2)
    	jal     move_ball_in_axis

    	# move_ball_in_axis(ball, HORIZONTAL, &ball->x_fraction, ball->dx)
    	move    $a0, $s2
    	# HORIZONTAL
    	li      $a1, HORIZONTAL
    	# &ball->x_fraction
    	la      $a2, BALL_X_FRAC_OFFSET($s2)
    	# ball->dx
    	lw      $a3, BALL_DX_OFFSET($s2)
    	jal     move_ball_in_axis

    	# if (ball->y > GRID_HEIGHT) ball->state = BALL_NONE
    	# ball->y
    	lw      $t3, BALL_Y_OFFSET($s2)
    	li      $t4, GRID_HEIGHT
    	bgt     $t3, $t4, move_balls_set_ball_none

move_balls_continue:
	# i++
	addi	$s1,$s1, 1

	j 	move_balls_ball_loop

move_balls_set_ball_none:
	# ball->state = BALL_NONE
	li	$t5, BALL_NONE
	sb	$t5, BALL_STATE_OFFSET($s2)
	j	move_balls_continue

move_balls_next_step:
	# step++
	addi	$s0, $s0, 1

	j	move_balls_step_loop

move_balls_end:
	j 	move_balls__epilogue

move_balls__epilogue:
	pop	$s4
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$s0
	pop	$ra
	end
	jr	$ra




################################################################################
# Handle all the movement of the ball in one axis (HORIZONTAL/VERTICAL) 
# by 'delta' amount.
# .TEXT <move_ball_in_axis>
        .text
move_ball_in_axis:
	# Subset:   3
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3, $s4]
	# Uses:     [$a0, $a1, $a2, $a3, $v0]
	# Clobbers: [$t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8, $t9]
	#
	# Locals:   - None
	#
	# Structure:
	#   move_ball_in_axis
	#   -> [prologue]
	#       -> body
	#           -> move_ball_in_axis_start
	#           -> move_ball_in_axis_negative
	#           -> move_ball_in_axis_positive
	#           -> move_ball_in_axis_end
	#   -> [epilogue]

move_ball_in_axis__prologue:
	begin
	push	$ra
	push	$s0
	push	$s1
	push	$s2
	push	$s3
	push	$s4
move_ball_in_axis__body:
	# *ball
	move	$s0, $a0		
	# axis
	move	$s1, $a1		
	# *fraction
	lb	$s2, 0($a2)		
	# delta
	move	$s3, $a3		
	move	$s4, $a2

	# *fraction += delta;
	add	$s2, $s2, $s3

move_ball_in_axis_start:
	# if (*fraction < 0)
	bltz	$s2, move_ball_in_axis_negative
	# else if (*fraction >= BALL_FRACTION)
	bge	$s2, BALL_FRACTION, move_ball_in_axis_positive
	# return;
	j	move_ball_in_axis_end

move_ball_in_axis_negative:
	# *fraction += BALL_FRACTION
	add	$s2, $s2, BALL_FRACTION      
	sw	$s2, 0($s4)
	# move_ball_one_cell(ball, axis, -1)
	li	$a2, -1
	move	$a0, $s0
	move	$a1, $s1
	jal	move_ball_one_cell  
	lw	$s2, 0($s4)
	j	move_ball_in_axis_start

move_ball_in_axis_positive:
	# *fraction -= BALL_FRACTION
	sub	$s2, $s2, BALL_FRACTION       
	sw	$s2, 0($s4)
	# move_ball_one_cell(ball, axis, 1)

	li	$a2, 1
	move	$a0, $s0
	move	$a1, $s1
	jal	move_ball_one_cell  
	lw	$s2, 0($s4)
	j	move_ball_in_axis_start

move_ball_in_axis_end:
	sw	$s2, 0($s4)
	j 	move_ball_in_axis__epilogue

move_ball_in_axis__epilogue:
	pop 	$s4
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$s0
	pop	$ra
	end
	jr	$ra


################################################################################
# Handle the actions needed when a ball collides with a brick.
        .text
hit_brick:
	# Subset:   3
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3, $s4]
	# Uses:     [$a0, $a1, $v0]
	# Clobbers: [$t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7, $t8, $t9]
	#
	# Locals:   - None
	#
	# Structure:
	#   hit_brick
	#   -> [prologue]
	#       -> body
	#           -> destroy_right
	#           -> destroy_left
	#           -> update_bricks_destroyed
	#           -> hit_brick_end
	#   -> [epilogue]

hit_brick__prologue:
	begin
	push    $ra
	push    $s0
	push    $s1
	push    $s2
	push    $s3
	push    $s4

hit_brick__body:
	# row
	move    $s0, $a0        
	# original_col
	move    $s1, $a1        
	la      $t0, bricks
	mul     $t1, $s0, MAX_GRID_WIDTH
	add     $t1, $t1, $s1
	add     $t0, $t0, $t1
	# brick_num = bricks[row][original_col]
	lb      $s2, 0($t0)     
	# col = original_col
	move    $s3, $s1        

destroy_right:
	# if col >= grid_width, go to destroy_left
	lw      $t2, grid_width
	bge     $s3, $t2, destroy_left 

check_right:
	# if (bricks[row][col] != brick_num) go to destroy_left
	la      $t0, bricks
	mul     $t1, $s0, MAX_GRID_WIDTH
	add     $t1, $t1, $s3
	add     $t0, $t0, $t1
	lb      $t3, 0($t0)
	bne     $t3, $s2, destroy_left 

	# bricks[row][col] = 0
	sb      $zero, 0($t0)          
	move    $a0, $s3
	move    $a1, $s0
	# register_screen_update(col, row)
	jal     register_screen_update

	# col++;
	addi    $s3, $s3, 1
	j       check_right

destroy_left:
	# col = original_col - 1
	addi    $s3, $s1, -1

destroy_left_loop:
	# if col < 0, go to update_bricks_destroyed
	bltz    $s3, update_bricks_destroyed 

check_left:
	# if (bricks[row][col] != brick_num) go to update_bricks_destroyed
	la      $t0, bricks
	mul     $t1, $s0, MAX_GRID_WIDTH
	add     $t1, $t1, $s3
	add     $t0, $t0, $t1
	lb      $t3, 0($t0)
	bne     $t3, $s2, update_bricks_destroyed 

	# bricks[row][col] = 0
	sb      $zero, 0($t0)          
	move    $a0, $s3
	move    $a1, $s0
	# register_screen_update(col, row)
	jal     register_screen_update

	# col--;
	addi    $s3, $s3, -1
	j       destroy_left_loop

update_bricks_destroyed:
	# bricks_destroyed++
	lw      $t4, bricks_destroyed
	addi    $t4, $t4, 1
	sw      $t4, bricks_destroyed

	# Every 10 bricks destroyed spawn a new ball
	# if (bricks_destroyed % 10 != 0) go to end
	li      $t5, 10
	rem     $t6, $t4, $t5
	bnez    $t6, hit_brick_end 

	# if (!spawn_new_ball()) go to end
	jal     spawn_new_ball
	beqz    $v0, hit_brick_end 

	# Print bonus message
	la      $a0, str_hit_brick_bonus_ball
	li      $v0, 4
	syscall

hit_brick_end:
	j       hit_brick__epilogue

hit_brick__epilogue:
	pop     $s4
	pop     $s3
	pop     $s2
	pop     $s1
	pop     $s0
	pop     $ra
	end
	jr      $ra

################################################################################
# Check for if movement of the paddle has caused collision with a ball. If so, 
# we kick that ball upwarsds, give the ball a large horizontal velocity,
# and turn it into a 'SUPER_BALL'.
# .TEXT <check_ball_paddle_collision>
        .text
check_ball_paddle_collision:
	# Subset:   3
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3]
	# Uses:     [$v0, $a0, $a1]
	# Clobbers: [$t0, $t1, $t2, $t3, $t4, $t5]
	#
	# Locals:   - None
	#
	# Structure: 
	#   check_ball_paddle_collision
	#   -> [prologue]
	#       -> body
	#           -> check_ball_paddle_collision_start_loop
	#           -> check_ball_paddle_collision_continue_loop
	#           -> skip_negate_dx
	#           -> check_ball_paddle_collision_end_loop
	#   -> [epilogue]

check_ball_paddle_collision__prologue:
	begin
	push	$ra
	push	$s0
	push	$s1
	push	$s2
	push	$s3

check_ball_paddle_collision__body:
	# int i = 0;
	li	$s0, 0		

	j check_ball_paddle_collision_start_loop

check_ball_paddle_collision_start_loop:
	# if (i >= MAX_BALLS) goto end_loop
	bge	$s0, MAX_BALLS, check_ball_paddle_collision_end_loop

	# if (balls[i].state == BALL_NONE) goto continue_loop
        la      $t0, balls
        mul     $t1, $s0, SIZEOF_BALL
        add     $t0, $t0, $t1
        lb      $t2, BALL_STATE_OFFSET($t0)   
        beq     $t2, BALL_NONE, check_ball_paddle_collision_continue_loop

	# if (balls[i].y != PADDLE_ROW) goto continue_loop
        lw      $t2, BALL_Y_OFFSET($t0)
        li      $t3, PADDLE_ROW
        bne     $t2, $t3, check_ball_paddle_collision_continue_loop

	# if (balls[i].dy < 0) goto continue_loop
        lw      $t2, BALL_DY_OFFSET($t0)
        bltz    $t2, check_ball_paddle_collision_continue_loop

	# if (balls[i].x < paddle_x) goto continue_loop
        lw      $t2, BALL_X_OFFSET($t0)
        lw      $t3, paddle_x
        blt     $t2, $t3, check_ball_paddle_collision_continue_loop

	# if (balls[i].x >= paddle_x + PADDLE_WIDTH) goto continue_loop
        lw      $t3, paddle_x
        addi    $t3, $t3, PADDLE_WIDTH
        bge     $t2, $t3, check_ball_paddle_collision_continue_loop

        # Collision detected
        # balls[i].y -= 1
        lw      $t2, BALL_Y_OFFSET($t0)
        addi    $t2, $t2, -1
        sw      $t2, BALL_Y_OFFSET($t0)

	# balls[i].dy *= -1
        lw      $t2, BALL_DY_OFFSET($t0)
        neg    	$t2, $t2
        sw      $t2, BALL_DY_OFFSET($t0)

	# balls[i].dx = BALL_FRACTION * 3 / 2
        li      $t2, BALL_FRACTION
        li      $t3, 3
        mul     $t2, $t2, $t3
        li      $t3, 2
        div     $t2, $t2, $t3
        sw      $t2, BALL_DX_OFFSET($t0)

	# if (balls[i].x - paddle_x <= PADDLE_WIDTH / 2) balls[i].dx *= -1
        lw      $t2, BALL_X_OFFSET($t0)
        lw      $t3, paddle_x
        sub     $t2, $t2, $t3
        li      $t3, PADDLE_WIDTH
        div     $t3, $t3, 2
        blez    $t2, skip_negate_dx
        lw      $t2, BALL_DX_OFFSET($t0)
        neg    	$t2, $t2
        sw      $t2, BALL_DX_OFFSET($t0)
skip_negate_dx:

	# balls[i].state = BALL_SUPER
        li      $t2, BALL_SUPER
        sb      $t2, BALL_STATE_OFFSET($t0)

	# score += 2
        lw      $t2, score
        addi    $t2, $t2, 2
        sw      $t2, score

check_ball_paddle_collision_continue_loop:
	# i++
	addi	$s0, $s0, 1

	j check_ball_paddle_collision_start_loop

check_ball_paddle_collision_end_loop:
	j check_ball_paddle_collision__epilogue

check_ball_paddle_collision__epilogue:
	pop	$s3
	pop	$s2
	pop	$s1
	pop	$s0
	pop	$ra
	end
	jr	$ra


################################################################################
# Handle the movement of the ball by one grid cell.
#        axis = VERTICAL, direction = -1  for up
#        axis = VERTICAL, direction =  1  for down
#        axis = HORIZONTAL, direction = -1  for left
#        axis = HORIZONTAL, direction =  1  for right
# .TEXT <move_ball_one_cell>
        .text
move_ball_one_cell:
    # Subset:   3
    #
    # Frame:    [$ra, $s0, $s1, $s2, $s3, $s4, $s5]
    # Uses:     [$a0, $a1, $a2]
    # Clobbers: [$t0, $t1, $t2, $t3, $t4, $t5, $t6, $t7]
    #
    # Locals:
    #   - $s0: ball
    #   - $s1: axis
    #   - $s2: direction
    #   - $s3: axis_position
    #   - $s4: axis_velocity
    #   - $s5: axis_fraction
    #
    # Structure:
    #   move_ball_one_cell
    #   -> [prologue]
    #       -> body
    #           -> move_ball_one_cell__increment_position
    #           -> move_ball_one_cell__collision_check
    #           -> horizontal_wall_check
    #           -> brick_check
    #           -> move_ball_one_cell__collision_wall
    #           -> move_ball_one_cell__collision_paddle
    #               -> paddle_check_end
    #               -> move_ball_one_cell__paddle_hit
    #                   -> right_paddle_hit
    #                   -> left_paddle_hit
    #                   -> paddle_speed_check
    #                   -> limit_speed_low
    #                   -> limit_speed_high
    #               -> horizontal_paddle
    #           -> move_ball_one_cell__collision_brick
    #               -> not_super_ball
    #           -> move_ball_one_cell__no_collision
    #           -> move_ball_one_cell__collision_handling
    #               -> no_hit
    #       -> epilogue
    #   -> [epilogue]

move_ball_one_cell__prologue:
    	begin
    	push    $ra
    	push    $s0
    	push    $s1
    	push    $s2
    	push    $s3
    	push    $s4
    	push    $s5

move_ball_one_cell__body:
    	move    $s0, $a0          # ball
    	move    $s1, $a1          # axis
    	move    $s2, $a2          # direction

	# register_screen_update(ball->x, ball->y)
	lw      $t0, BALL_X_OFFSET($s0)
	lw      $t1, BALL_Y_OFFSET($s0)
	move    $a0, $t0
	move    $a1, $t1
	jal     register_screen_update

	# Select axis position, velocity, and fraction pointers
	beq     $s1, VERTICAL, vertical_axis
horizontal_axis:
	# axis_position = &ball->x; axis_velocity = &ball->dx; axis_fraction = &ball->x_fraction
	la      $s3, BALL_X_OFFSET($s0)
	la      $s4, BALL_DX_OFFSET($s0)
	la      $s5, BALL_X_FRAC_OFFSET($s0)
	j       move_ball_one_cell__increment_position

vertical_axis:
	# axis_position = &ball->y; axis_velocity = &ball->dy; axis_fraction = &ball->y_fraction
	la      $s3, BALL_Y_OFFSET($s0)
	la      $s4, BALL_DY_OFFSET($s0)
	la      $s5, BALL_Y_FRAC_OFFSET($s0)

move_ball_one_cell__increment_position:
	# *axis_position += direction
	lw      $t2, 0($s3)
	add     $t2, $t2, $s2
	sw      $t2, 0($s3)

	# Initialize hit to FALSE
	li      $t3, FALSE

move_ball_one_cell__collision_check:
	# Check for collision with wall
	# if (*axis_position < 0) goto collision_wall
	bltz    $t2, move_ball_one_cell__collision_wall
	beq     $s1, HORIZONTAL, horizontal_wall_check
	j       collision_checks

horizontal_wall_check:
	# if (axis == HORIZONTAL && *axis_position >= grid_width) goto collision_wall
	lw      $t4, grid_width
	bge     $t2, $t4, move_ball_one_cell__collision_wall

collision_checks:
	# if (ball->y == PADDLE_ROW) goto collision_paddle
	lw      $t5, BALL_Y_OFFSET($s0)
	li      $t6, PADDLE_ROW
	beq     $t5, $t6, move_ball_one_cell__collision_paddle

	# if (ball->y < GRID_HEIGHT && bricks[ball->y][ball->x]) goto collision_brick
	lw      $t7, BALL_Y_OFFSET($s0)
	li      $t8, GRID_HEIGHT
	blt     $t7, $t8, brick_check

	j       move_ball_one_cell__no_collision

brick_check:
	# Check if there's a brick at ball's position
	mul     $t9, $t7, MAX_GRID_WIDTH
	lw      $t0, BALL_X_OFFSET($s0)
	add     $t9, $t9, $t0
	lb      $t1, bricks($t9)
	bnez    $t1, move_ball_one_cell__collision_brick

	j       move_ball_one_cell__no_collision

move_ball_one_cell__collision_wall:
	# collision_wall: hit = TRUE
	li      $t3, TRUE
	j       move_ball_one_cell__collision_handling

move_ball_one_cell__collision_paddle:
	# collision_paddle: hit = paddle_x <= ball->x && ball->x < paddle_x + PADDLE_WIDTH
	lw      $t2, BALL_X_OFFSET($s0)
	lw      $t4, paddle_x
	ble     $t4, $t2, paddle_check_end
	j       move_ball_one_cell__no_collision

paddle_check_end:
	addi    $t4, $t4, PADDLE_WIDTH
	blt     $t2, $t4, move_ball_one_cell__paddle_hit
	j       move_ball_one_cell__no_collision

move_ball_one_cell__paddle_hit:
	# hit = TRUE if the ball hits the paddle
	li      $t3, TRUE
	beq     $s1, HORIZONTAL, horizontal_paddle

	# Handle ball hitting paddle in vertical direction
	li      $t7, 2
	div     $t7, PADDLE_WIDTH, $t7
	blt     $t2, $t4, left_paddle_hit
right_paddle_hit:
	addi    $t8, $t4, 3
	sw      $t8, BALL_DX_OFFSET($s0)
	j       paddle_speed_check

left_paddle_hit:
	sub     $t8, $t4, 3
	sw      $t8, BALL_DX_OFFSET($s0)

paddle_speed_check:
	# Cap the ball's speed
	lw      $t9, BALL_FRACTION($s0)
	div     $t9, $t9, BALL_SIM_STEPS
	lw      $t0, BALL_DX_OFFSET($s0)
	neg     $t9, $t9

	blt     $t0, $t9, limit_speed_low
	bgt     $t0, $t9, limit_speed_high
	j       move_ball_one_cell__collision_handling

limit_speed_low:
	neg     $t9, $t9
	sw      $t9, BALL_DX_OFFSET($s0)
	j       move_ball_one_cell__collision_handling

limit_speed_high:
	sw      $t9, BALL_DX_OFFSET($s0)
	j       move_ball_one_cell__collision_handling

horizontal_paddle:
	# Handle ball hitting paddle in horizontal direction
	lw      $t0, BALL_DY_OFFSET($s0)
	neg     $t0, $t0
	sw      $t0, BALL_DY_OFFSET($s0)
	j       move_ball_one_cell__collision_handling

move_ball_one_cell__collision_brick:
	# collision_brick: if (ball->state != BALL_SUPER) hit = TRUE
	lw      $t0, BALL_STATE_OFFSET($s0)
	li      $t1, BALL_SUPER
	bne     $t0, $t1, not_super_ball
	j       move_ball_one_cell__collision_handling

not_super_ball:
	# Handle brick collision
	li      $t3, TRUE
	lw    	$a0, BALL_Y_OFFSET($s0)
	lw    	$a1, BALL_X_OFFSET($s0)
	jal     hit_brick

	# score += 5 * (combo_bonus + 1)
	lw      $t0, score
	lw	$t1, combo_bonus
	addi	$t1, $t1, 1
	li      $t2, 5
	mul     $t2, $t1, $t2
	add     $t0, $t0, $t2
	sw      $t0, score

	# combo_bonus++
	lw      $t0, combo_bonus
	addi    $t0, $t0, 1
	sw      $t0, combo_bonus
	j       move_ball_one_cell__collision_handling

move_ball_one_cell__no_collision:
	# no_collision: register_screen_update(ball->x, ball->y)
	lw      $t0, BALL_X_OFFSET($s0)
	lw      $t1, BALL_Y_OFFSET($s0)
	move    $a0, $t0
	move    $a1, $t1
	jal     register_screen_update
	j       move_ball_one_cell__epilogue

move_ball_one_cell__collision_handling:
	# collision_handling: if (hit) { ball->state = BALL_NORMAL; ... }
	beqz    $t3, no_hit
	li      $t0, BALL_NORMAL
	sw      $t0, BALL_STATE_OFFSET($s0)

	# *axis_fraction = (BALL_FRACTION - 1) - *axis_fraction
	lw      $t0, BALL_FRACTION($s0)
	li	$t8, BALL_FRACTION
	sub     $t0, $t8, 1
	lw	$t9, 0($s5)
	sub     $t0, $t0, $t9
	sw      $t0, 0($s5)

	# *axis_position -= direction
	lw      $t0, 0($s3)
	sub     $t0, $t0, $s2
	sw      $t0, 0($s3)
	
	# *axis_velocity *= -1
	lw      $t0, 0($s4)
	neg     $t0, $t0
	sw      $t0, 0($s4)

no_hit:
	# register_screen_update(ball->x, ball->y)
	lw      $t0, BALL_X_OFFSET($s0)
	lw      $t1, BALL_Y_OFFSET($s0)
	move    $a0, $t0
	move    $a1, $t1
	jal     register_screen_update

move_ball_one_cell__epilogue:
	pop     $s5
	pop     $s4
	pop     $s3
	pop     $s2
	pop     $s1
	pop     $s0
	pop     $ra
	end
	jr      $ra

################################################################################
################################################################################
###                   PROVIDED FUNCTIONS — DO NOT CHANGE                     ###
################################################################################
################################################################################

################################################################################
# .TEXT <run_command>
        .text
run_command:
	# Provided
	#
	# Frame:    [$ra]
	# Uses:     [$ra, $t0, $a0, $v0]
	# Clobbers: [$t0, $a0, $v0]
	#
	# Locals:
	#   - $t0: char command
	#
	# Structure:
	#   run_command
	#   -> [prologue]
	#     -> body
	#       -> cmd_a
	#       -> cmd_d
	#       -> cmd_A
	#       -> cmd_D
	#       -> cmd_dot
	#       -> cmd_semicolon
	#       -> cmd_comma
	#       -> cmd_question_mark
	#       -> cmd_s
	#       -> cmd_h
	#       -> cmd_p
	#       -> cmd_q
	#       -> bad_cmd
	#       -> ret_true
	#   -> [epilogue]

run_command__prologue:
	push	$ra

run_command__body:
	li	$v0, 4						# syscall 4: print_string
	li	$a0, str_run_command_prompt			# " >> "
	syscall							# printf(" >> ");

	li	$v0, 12						# syscall 4: read_character
	syscall							# scanf(" %c",
	move	$t0, $v0					#              &command);

	beq	$t0, 'a', run_command__cmd_a			# if (command == 'a') { ...
	beq	$t0, 'd', run_command__cmd_d			# } else if (command == 'd') { ...
	beq	$t0, 'A', run_command__cmd_A			# } else if (command == 'A') { ...
	beq	$t0, 'D', run_command__cmd_D			# } else if (command == 'D') { ...
	beq	$t0, '.', run_command__cmd_dot			# } else if (command == '.') { ...
	beq	$t0, ';', run_command__cmd_semicolon		# } else if (command == ';') { ...
	beq	$t0, ',', run_command__cmd_comma		# } else if (command == ',') { ...
	beq	$t0, '?', run_command__cmd_question_mark	# } else if (command == '?') { ...
	beq	$t0, 's', run_command__cmd_s			# } else if (command == 's') { ...
	beq	$t0, 'h', run_command__cmd_h			# } else if (command == 'h') { ...
	beq	$t0, 'p', run_command__cmd_p			# } else if (command == 'p') { ...
	beq	$t0, 'q', run_command__cmd_q			# } else if (command == 'q') { ...
	b	run_command__bad_cmd				# } else { ...

run_command__cmd_a:						# if (command == 'a') {
	li	$a0, -1
	jal	move_paddle					#   move_paddle(-1);
	b	run_command__ret_true

run_command__cmd_d:						# } else if (command == 'd') { ...
	li	$a0, 1
	jal	move_paddle					#   move_paddle(1);
	b	run_command__ret_true

run_command__cmd_A:						# } else if (command == 'A') { ...
	li	$a0, -1
	jal	move_paddle					#   move_paddle(-1);
	li	$a0, -1
	jal	move_paddle					#   move_paddle(-1);
	li	$a0, -1
	jal	move_paddle					#   move_paddle(-1);
	b	run_command__ret_true

run_command__cmd_D:						# } else if (command == 'D') { ...
	li	$a0, 1
	jal	move_paddle					#   move_paddle(1);
	li	$a0, 1
	jal	move_paddle					#   move_paddle(1);
	li	$a0, 1
	jal	move_paddle					#   move_paddle(1);
	b	run_command__ret_true

run_command__cmd_dot:						# } else if (command == '.') { ...
	li	$a0, BALL_SIM_STEPS
	jal	move_balls					#   move_balls(BALL_SIM_STEPS);
	b	run_command__ret_true

run_command__cmd_semicolon:					# } else if (command == ';') { ...
	li	$a0, BALL_SIM_STEPS
	mul	$a0, $a0, 3					#   BALL_SIM_STEPS * 3
	jal	move_balls					#   move_balls(BALL_SIM_STEPS * 3);
	b	run_command__ret_true

run_command__cmd_comma:						# } else if (command == ',') { ...
	li	$a0, 1
	jal	move_balls					#   move_balls(1);
	b	run_command__ret_true

run_command__cmd_question_mark:					# } else if (command == '?') { ...
	jal	print_debug_info				#   print_debug_info();
	b	run_command__ret_true

run_command__cmd_s:						# } else if (command == 's') { ...
	jal	print_screen_updates				#   print_screen_updates();
	b	run_command__ret_true

run_command__cmd_h:						# } else if (command == 'h') { ...
	jal	print_welcome					#   print_welcome();
	b	run_command__ret_true

run_command__cmd_p:						# } else if (command == 'p') { ...
	li	$a0, TRUE
	sw	$a0, no_auto_print				#   no_auto_print = 1;
	jal	print_game					#   print_game();
	b	run_command__ret_true

run_command__cmd_q:						# } else if (command == 'q') { ...
	li	$v0, 10						#   syscall 10: exit
	syscall							#   exit(0);

run_command__bad_cmd:						# } else { ...

	li	$v0, 4						#   syscall 4: print_string
	li	$a0, str_run_command_bad_cmd_1			#   "Bad command: '"
	syscall							#   printf("Bad command: '");

	li	$v0, 11						#   syscall 11: print_character
	move	$a0, $t0					#           command
	syscall							#   putchar(       );

	li	$v0, 4						#   syscall 4: print_string
	li	$a0, str_run_command_bad_cmd_2			#   "'. Run `h` for help.\n"
	syscall							#   printf("'. Run `h` for help.\n");

	li	$v0, FALSE
	b	run_command__epilogue				#   return FALSE;

run_command__ret_true:						# }
	li	$v0, TRUE					# return TRUE;

run_command__epilogue:
	pop	$ra
	jr	$ra

################################################################################
# .TEXT <print_debug_info>
        .text
print_debug_info:
	# Provided
	#
	# Frame:    []
	# Uses:     [$v0, $a0, $t0, $t1, $t2, $t3]
	# Clobbers: [$v0, $a0, $t0, $t1, $t2, $t3]
	#
	# Locals:
	#   - $t0: int i, int row
	#   - $t1: struct ball *ball, int col
	#   - $t2: temporary copy of grid_width
	#   - $t3: temporary bricks[row][col] address calculations
	#
	# Structure:
	#   print_debug_info
	#   -> [prologue]
	#     -> body
	#       -> ball_loop_init
	#       -> ball_loop_cond
	#       -> ball_loop_body
	#       -> ball_loop_step
	#       -> row_loop_init
	#       -> row_loop_cond
	#       -> row_loop_body
	#         -> row_loop_init
	#         -> row_loop_cond
	#         -> row_loop_body
	#         -> row_loop_step
	#         -> row_loop_end
	#       -> row_loop_step
	#       -> row_loop_end
	#   -> [epilogue]

print_debug_info__prologue:

print_debug_info__body:
	li	$v0, 4				# syscall 4: print_string
	li	$a0, str_print_debug_info_1	# "      grid_width = "
	syscall					# printf("      grid_width = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, grid_width			#              grid_width
	syscall					# printf("%d",           );

	li	$v0, 11				# syscall 11: print_character
	li	$a0, '\n'
	syscall					# putchar('\n');


	li	$v0, 4				# syscall 4: print_string
	li	$a0, str_print_debug_info_2	# "        paddle_x = "
	syscall					# printf("        paddle_x = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, paddle_x			#              paddle_x
	syscall					# printf("%d",         );

	li	$v0, 11				# syscall 11: print_character
	li	$a0, '\n'
	syscall					# putchar('\n');


	li	$v0, 4				# syscall 4: print_string
	li	$a0, str_print_debug_info_3	# "bricks_destroyed = "
	syscall					# printf("bricks_destroyed = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, bricks_destroyed		#              bricks_destroyed
	syscall					# printf("%d",                 );

	li	$v0, 11				# syscall 11: print_character
	li	$a0, '\n'
	syscall					# putchar('\n');


	li	$v0, 4				# syscall 4: print_string
	li	$a0, str_print_debug_info_4	# "    total_bricks = "
	syscall					# printf("    total_bricks = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, total_bricks		#              total_bricks
	syscall					# printf("%d",             );

	li	$v0, 11				# syscall 11: print_character
	li	$a0, '\n'
	syscall					# putchar('\n');


	li	$v0, 4				# syscall 4: print_string
	li	$a0, str_print_debug_info_5	# "           score = "
	syscall					# printf("           score = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, score			#              score
	syscall					# printf("%d",      );

	li	$v0, 11				# syscall 11: print_character
	li	$a0, '\n'
	syscall					# putchar('\n');


	li	$v0, 4				# syscall 4: print_string
	li	$a0, str_print_debug_info_6	# "     combo_bonus = "
	syscall					# printf("     combo_bonus = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, combo_bonus		#              combo_bonus
	syscall					# printf("%d",            );

	li	$v0, 11				# syscall 11: print_character
	li	$a0, '\n'
	syscall					# putchar('\n');
	syscall					# putchar('\n');


	li	$v0, 4				# syscall 4: print_string
	li	$a0, str_print_debug_info_7	# "        num_screen_updates = "
	syscall					# printf("        num_screen_updates = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, num_screen_updates		#              num_screen_updates
	syscall					# printf("%d",                   );

	li	$v0, 11				# syscall 11: print_character
	li	$a0, '\n'
	syscall					# putchar('\n');


	li	$v0, 4				# syscall 4: print_string
	li	$a0, str_print_debug_info_8	# "whole_screen_update_needed = "
	syscall					# printf("whole_screen_update_needed = ");

	li	$v0, 1				# sycall 1: print_int
	lw	$a0, whole_screen_update_needed	#              whole_screen_update_needed
	syscall					# printf("%d",                           );

	li	$v0, 11				# syscall 11: print_character
	li	$a0, '\n'
	syscall					# putchar('\n');
	syscall					# putchar('\n');

print_debug_info__ball_loop_init:
	li	$t0, 0				# int i = 0;

print_debug_info__ball_loop_cond:		# while (i < MAX_BALLS) {
	bge	$t0, MAX_BALLS, print_debug_info__ball_loop_end

print_debug_info__ball_loop_body:
	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_9	#   "ball["
	syscall					#   printf("ball[");

	li	$v0, 1				#   sycall 1: print_int
	move	$a0, $t0			#                i
	syscall					#   printf("%d",  );

	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_21	#   "]:\n"
	syscall					#   printf("]:\n");

	mul	$t1, $t0, SIZEOF_BALL		#   i * sizeof(struct ball)
	addi	$t1, $t1, balls			#   ball = &balls[i]

	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_10	#   "  y: "
	syscall					#   printf("  y: ");

	li	$v0, 1				#   sycall 1: print_int
	lw	$a0, BALL_Y_OFFSET($t1)		#   ball->y
	syscall					#   printf("%d", ball->y);

	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_11	#   "  x: "
	syscall					#   printf("  x: ");

	li	$v0, 1				#   sycall 1: print_int
	lw	$a0, BALL_X_OFFSET($t1)		#   ball->x
	syscall					#   printf("%d", ball->x);

	li	$v0, 11				#   syscall 11: print_character
	li	$a0, '\n'
	syscall					#   putchar('\n');

	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_12	#   "  x_fraction: "
	syscall					#   printf("  x_fraction: ");

	li	$v0, 1				#   sycall 1: print_int
	lw	$a0, BALL_X_FRAC_OFFSET($t1)	#   ball->x_fraction
	syscall					#   printf("%d", ball->x_fraction);

	li	$v0, 11				#   syscall 11: print_character
	li	$a0, '\n'
	syscall					#   putchar('\n');

	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_13	#   "  y_fraction: "
	syscall					#   printf("  y_fraction: ");

	li	$v0, 1				#   sycall 1: print_int
	lw	$a0, BALL_Y_FRAC_OFFSET($t1)	#   ball->y_fraction
	syscall					#   printf("%d", ball->y_fraction);

	li	$v0, 11				#   syscall 11: print_character
	li	$a0, '\n'
	syscall					#   putchar('\n');

	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_14	#   "  dy: "
	syscall					#   printf("  dy: ");

	li	$v0, 1				#   sycall 1: print_int
	lw	$a0, BALL_DY_OFFSET($t1)	#   ball->dy
	syscall					#   printf("%d", ball->dy);

	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_15	#   "  dx: "
	syscall					#   printf("  dx: ");

	li	$v0, 1				#   sycall 1: print_int
	lw	$a0, BALL_DX_OFFSET($t1)	#   ball->dx
	syscall					#   printf("%d", ball->dx);

	li	$v0, 11				#   syscall 11: print_character
	li	$a0, '\n'
	syscall					#   putchar('\n');

	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_16	#   "  state: "
	syscall					#   printf("  state: ");

	li	$v0, 1				#   sycall 1: print_int
	lb	$a0, BALL_STATE_OFFSET($t1)	#   ball->state
	syscall					#   printf("%d", ball->state);

	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_17	#   " ("
	syscall					#   printf(" (");

	li	$v0, 11				#   sycall 11: print_character
	lb	$a0, BALL_STATE_OFFSET($t1)	#   ball->state
	syscall					#   printf("%c", ball->state);

	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_18	#   ")\n"
	syscall					#   printf(")\n");

print_debug_info__ball_loop_step:
	addi	$t0, $t0, 1			#   i++;
	b	print_debug_info__ball_loop_cond

print_debug_info__ball_loop_end:		# }


print_debug_info__row_loop_init:
	li	$t0, 0				# int row = 0;

print_debug_info__row_loop_cond:		# while (row < GRID_HEIGHT) {
	bge	$t0, GRID_HEIGHT, print_debug_info__row_loop_end

print_debug_info__row_loop_body:
	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_19	#   "\nbricks["
	syscall					#   printf("\nbricks[");

	li	$v0, 1				#   sycall 1: print_int
	move	$a0, $t0			#                i
	syscall					#   printf("%d",  );

	li	$v0, 4				#   syscall 4: print_string
	li	$a0, str_print_debug_info_20	#   "]: "
	syscall					#   printf("]: ");

print_debug_info__col_loop_init:
	li	$t1, 0				#   int col = 0;

print_debug_info__col_loop_cond:		#   while (col < grid_width) {
	lw	$t2, grid_width
	bge	$t1, $t2, print_debug_info__col_loop_end

print_debug_info__col_loop_body:
	mul	$t3, $t0, MAX_GRID_WIDTH	#     row * MAX_GRID_WIDTH
	add	$t3, $t3, $t1			#     row * MAX_GRID_WIDTH + row
	addi	$t3, $t3, bricks		#     &bricks[row][col]

	li	$v0, 1				#     sycall 1: print_int
	lb	$a0, ($t3)			#     bricks[row][col]
	syscall					#     printf("%d", bricks[row][col]);

	li	$v0, 11				#     sycall 11: print_character
	li	$a0, ' '
	syscall					#     printf(" ");

print_debug_info__col_loop_step:
	addi	$t1, $t1, 1			#     row++;
	b	print_debug_info__col_loop_cond

print_debug_info__col_loop_end:			#   }

print_debug_info__row_loop_step:
	addi	$t0, $t0, 1			#   row++;
	b	print_debug_info__row_loop_cond

print_debug_info__row_loop_end:			# }
	li	$v0, 11				#   syscall 11: print_character
	li	$a0, '\n'
	syscall					#   putchar('\n');

print_debug_info__epilogue:
	jr	$ra


################################################################################
# .TEXT <print_screen_updates>
        .text
print_screen_updates:
	# Provided
	#
	# Frame:    [$ra, $s0, $s1, $s2]
	# Uses:     [$ra, $s0, $s1, $s2, $t0, $t1, $t2, $t3, $t4, $v0, $a0]
	# Clobbers: [$t0, $t1, $t2, $t3, $t4, $v0, $a0]
	#
	# Locals:
	#   - $t0: print_cell return value, temporary screen_updates address calculations
	#   - $t1: copy of num_screen_updates
	#   - $t2: copy of whole_screen_update_needed
	#   - $t3: copy of grid_width
	#   - $t4: FALSE/0
	#   - $s0: int row, int i
	#   - $s1: int col, int y
	#   - $s2: int x
	#
	# Structure:
	#   print_screen_updates
	#   -> [prologue]
	#       -> body
	#       -> whole_screen
	#         -> row_loop_init
	#         -> row_loop_cond
	#         -> row_loop_body
	#           -> col_loop_init
	#           -> col_loop_cond
	#           -> col_loop_body
	#           -> col_loop_step
	#           -> col_loop_end
	#         -> row_loop_step
	#         -> row_loop_end
	#       -> not_whole_screen
	#         -> update_loop_init
	#         -> update_loop_cond
	#         -> update_loop_body
	#         -> update_loop_step
	#         -> update_loop_end
	#       -> final_newline
	#   -> [epilogue]

print_screen_updates__prologue:
	push	$ra
	push	$s0
	push	$s1
	push	$s2

print_screen_updates__body:
	li	$v0, 11							# sycall 11: print_character
	li	$a0, '&'
	syscall								# putchar('&');

	li	$v0, 1							#   syscall 1: print_int
	lw	$a0, score						#                score
	syscall								#   printf("%d",      );

	lw	$t2, whole_screen_update_needed

	beqz	$t2, print_screen_updates__not_whole_screen		# if (whole_screen_update_needed) {

print_screen_updates__whole_screen:
print_screen_updates__row_loop_init:
	li	$s0, 0							#   int row = 0;

print_screen_updates__row_loop_cond:
	bge	$s0, GRID_HEIGHT, print_screen_updates__row_loop_end	#   while (row < GRID_HEIGHT) {

print_screen_updates__row_loop_body:
print_screen_updates__col_loop_init:
	li	$s1, 0							#     int col = 0;

print_screen_updates__col_loop_cond:
	lw	$t3, grid_width
	bge	$s1, $t3, print_screen_updates__col_loop_end		#     while (col < grid_width) {

print_screen_updates__col_loop_body:
	move	$a0, $s0						#       row
	move	$a1, $s1						#       col
	jal	print_cell						#       print_cell(row, col);
	move	$t0, $v0

	li	$v0, 11							#       sycall 11: print_character
	li	$a0, ' '
	syscall								#       printf(" ");

	li	$v0, 1							#       sycall 1: print_int
	move	$a0, $s0						#                    row
	syscall								#       printf("%d",    );

	li	$v0, 11							#       sycall 11: print_character
	li	$a0, ' '
	syscall								#       printf(" ");

	li	$v0, 1							#       sycall 1: print_int
	move	$a0, $s1						#                    col
	syscall								#       printf("%d",    );

	li	$v0, 11							#       sycall 11: print_character
	li	$a0, ' '
	syscall								#       printf(" ");

	li	$v0, 1							#       sycall 1: print_int
	move	$a0, $t0						#                    print_cell(...)
	syscall								#       printf("%d",                );

print_screen_updates__col_loop_step:

	addi	$s1, $s1, 1						#       col++;
	b	print_screen_updates__col_loop_cond			#     }

print_screen_updates__col_loop_end:
print_screen_updates__row_loop_step:
	addi	$s0, $s0, 1						#     row++;
	b	print_screen_updates__row_loop_cond			#   }


print_screen_updates__row_loop_end:
	b	print_screen_updates__final_newline			# } else {

print_screen_updates__not_whole_screen:
print_screen_updates__update_loop_init:
	li	$s0, 0							#   int i = 0;

print_screen_updates__update_loop_cond:
	lw	$t1, num_screen_updates
	bge	$s0, $t1, print_screen_updates__update_loop_end		#   while (i < num_screen_updates) {

print_screen_updates__update_loop_body:
	mul	$t0, $s0, SIZEOF_SCREEN_UPDATE				#     i * sizeof(struct screen_update)
	addi	$t0, $t0, screen_updates				#     &screen_updates[i]

	lw	$s1, SCREEN_UPDATE_Y_OFFSET($t0)			#     int y = screen_updates[i].y;
	lw	$s2, SCREEN_UPDATE_X_OFFSET($t0)			#     int x = screen_updates[i].x;

									#     if (y >= GRID_HEIGHT) continue;
	bge	$s1, GRID_HEIGHT, print_screen_updates__update_loop_step

	bltz	$s2, print_screen_updates__update_loop_step		#     if (x < 0) continue;

									#     if (x >= MAX_GRID_WIDTH) continue;
	bge	$s2, MAX_GRID_WIDTH, print_screen_updates__update_loop_step

	move	$a0, $s1						#     y
	move	$a1, $s2						#     x
	jal	print_cell						#     print_cell(y, x);
	move	$t0, $v0

	li	$v0, 11							#     sycall 11: print_character
	li	$a0, ' '
	syscall								#     printf(" ");

	li	$v0, 1							#     sycall 1: print_int
	move	$a0, $s1						#                  y
	syscall								#     printf("%d",  );

	li	$v0, 11							#     sycall 11: print_character
	li	$a0, ' '
	syscall								#     printf(" ");

	li	$v0, 1							#     sycall 1: print_int
	move	$a0, $s2						#                  x
	syscall								#     printf("%d",  );

	li	$v0, 11							#     sycall 11: print_character
	li	$a0, ' '
	syscall								#     printf(" ");

	li	$v0, 1							#     sycall 1: print_int
	move	$a0, $t0						#                  print_cell(...)
	syscall								#     printf("%d",                );

print_screen_updates__update_loop_step:
	addi	$s0, $s0, 1						#     col++;
	b	print_screen_updates__update_loop_cond			#   }

print_screen_updates__update_loop_end:
print_screen_updates__final_newline:					# }
	li	$v0, 11							# syscall 11: print_character
	li	$a0, '\n'
	syscall								# putchar('\n');

	li	$t4, FALSE
	sw	$t4, whole_screen_update_needed				# whole_screen_update_needed = FALSE;

	li	$t4, 0
	sw	$t4, num_screen_updates					# num_screen_updates = 0;

print_screen_updates__epilogue:
	pop	$s2
	pop	$s1
	pop	$s0
	pop	$ra

	jr	$ra
