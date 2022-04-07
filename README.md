# Overview
Return task list within the range of difficulty.

<p align="left">
<img height="20" src="https://latex.codecogs.com/svg.image?\bg{white}User's\&space;rate&space;&plus;&space;lower&space;<=&space;Difficulty&space;<=&space;User's\&space;rate&space;&plus;&space;upper" />
</p>

# Usage
``` py
import requests

user = "satory074"
lower = -100
upper = 100

url = f"https://script.google.com/macros/s/AKfycbx_twCi0cHMeL4Amq-fWwkaJljIKdowxOAhAOhQgzaSATQDLinis0TZzPqkvMa0lhB7/exec?user={user}&lower={lower}&upper={upper}"
response = requests.get(url)
data = response.json()

print(data)
```

# References
## [AtCoder](https://atcoder.jp/)

## [AtCoderProblems](https://github.com/kenkoooo/AtCoderProblems)
### [API / Datasets](https://github.com/kenkoooo/AtCoderProblems/blob/master/doc/api.md)
- Pairs of Contests and Problems
- User Submissions
- Estimated Difficulties of the Problems
