# @utility/file

[![JSR Version](https://jsr.io/badges/@utility/file)](https://jsr.io/@utility/date)
[![JSR Score](https://jsr.io/badges/@utility/file/score)](https://jsr.io/@utility/date/score)
[![Test Status](https://github.com/utilityjs/file/actions/workflows/test.yml/badge.svg)](https://github.com/utilityjs/date/actions/workflows/test.yml)
[![Coverage](https://codecov.io/gh/utilityjs/date/branch/main/graph/badge.svg?token=OzlniGFmNp)](https://codecov.io/gh/utilityjs/date)
[![License](https://img.shields.io/github/license/utilityjs/date.svg?label=License)](/LICENSE)

Collection of date utility functions

## Usage

```typescript
import { isISODate } from "@utility/date";

isISODate("2022-12-27T07:40:25.551Z");
// => true

isISODate("25/12/2022");
// => false
```
