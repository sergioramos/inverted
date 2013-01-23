MOCHA=node_modules/.bin/mocha test/specs -u qunit -t 4000

test:
	$(MOCHA) -R spec

coverage:
	rm -rf src-cov
	jscoverage src src-cov
	@INVERTED_COV=1 $(MOCHA) -R html-cov > test/coverage.html

.PHONY: test coverage