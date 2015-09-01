var redoku = (function() {

	var alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXYZ'.split('');

	var generateRegex = (function() {

		var ZERO_LENGTH_GOTCHAS = [
			// TODO: Maybe up the ante with lookaheads here...
			'.*', '.?', '[RR]*', 'R*', 'R?' //, '(R|R)?', 'R?(?=[0RR])'
		];

		var ONE_CLASS = [
			'[R0R]',
			'[R]?0',
			'0?',
			'[0]',
			'0R*',
			'0'
		];
		var TWO_CLASS = [
			'[R10]+',
			'0[R1R]',
			'[R0]1',
			'(01|RR)',
			'(RR|01)',
			'[1R0][1R]',
			'[1RR0]+',
			'R?[10R]+'
		];
		var THREE_CLASS = [
			'[2R10]+',
			'[102R]+',
			'0R*1[R2]',
			'R?0+1[2R]',
			'[1R2R0]+',
			'[2R]?[120R]+'
		];

		function boolRand() {
			return Math.random() > .5;
		}

		function esc(s) {
			return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
		}

		return function(chars, avoidSet) {

			// Characters that we can randomly use:
			var availableRandom = alpha.join('').replace(
				// Take out `chars` if no `avoidSet` is defined:
				RegExp('[' + esc((avoidSet||chars).join('')) + ']+', 'g'), ''
			).split('');

			var r = '';

			for (var i = 0, l = chars.length; i < l; i++) {
				var nextChars = chars.slice(i);

				if (boolRand()) r += use(ZERO_LENGTH_GOTCHAS, nextChars);

				if (boolRand() && i + 2 < l) {
					r += use(THREE_CLASS, nextChars);
					i += 2;
				} else if (i + 1 < l) {
					r += use(TWO_CLASS, nextChars);
					i += 1;
				} else {
					r += use(ONE_CLASS, nextChars);
				}

			}

			function use(a, chars) {
				return a[0 | Math.random () * a.length].replace(/\w/g, function($) {
					switch ($) {
						case 'R': return esc(availableRandom[0 | Math.random() * availableRandom.length]);
						default: return esc(chars[+$]);
					}
				});
			}
			return r;
		}

	}());

	return function(r, c) {

		var answers = Array(r*c+1).join().split('').map(function() {
			return alpha[0 | Math.random() * alpha.length];
		});

		var rHeaders = [], cHeaders = [];

		for (var ri = 0; ri < r; ++ri) {
			var rowChars = answers.slice(ri*c, c+ri*r);
			// console.log(rowChars, ri, r, c);
			rHeaders.push( generateRegex(rowChars) );
		}

		for (var ci = 0; ci < c; ++ci) {
			var colChars = [];
			for (var ri = 0; ri < r; ++ri) {
				colChars.push( answers[ri*c+ci] );
			}
			cHeaders.push( generateRegex(colChars) );
		}

		return {
			cols: cHeaders,
			rows: rHeaders,
			ans: answers
		}
	};

}());