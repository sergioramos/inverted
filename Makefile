REPORTER = spec
UI = qunit
TESTS = test/specs

test:
	@NODE_ENV=test ./node_modules/.bin/mocha $(TESTS) -u $(UI) -R $(REPORTER) -t 4000 -c -G -b

lib-cov:
	./node_modules/jscoverage/bin/jscoverage src lib-cov

test-cov:	lib-cov
	@INVERTED_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html
	rm -rf lib-cov

test-coveralls:	lib-cov
	echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	@INVERTED_COV=1 $(MAKE) test REPORTER=mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js
	rm -rf lib-cov

.PHONY: test