EXERCISES += breakout
CLEAN_FILES += breakout

breakout: breakout.c
	$(CC) -o $@ $<

.PHONY: submit give
submit give: breakout.s
	give cs1521 ass1_breakout breakout.s

.PHONY: test autotest
test autotest: breakout.s
	1521 autotest breakout
