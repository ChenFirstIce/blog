---
title: "算法笔记：普通数组"
date: "2026-04-24"
category: "算法"
tags: ["Algorithm", "Array", "LeetCode"]
excerpt: "整理普通数组题型的模板、性质和个人题解记录。"
draft: false
---
# 板子

---
# 性质

---
# 题目+题解

##

### 我的解法
- 1：哈哈完全写错，题目提示说的分治法肯定不是这种分治法
	- **思路**：
	- **代码**：
```cpp
class Solution {
public:
    int a = 0;
    
    int solve(vector<int>& nums, int l, int r){
        if(r  == l + 2){
            a = max(a, nums[l] + nums[l + 1]);
            return nums[l] + nums[l + 1];
        }else if (r < l + 2){
            a = max(a, nums[l]);
            return nums[l];
        }

        int ans1 = solve(nums,l,(r + l) / 2);
        int ans2 = solve(nums,(r + l) / 2, r);

        a = max(a, ans1 + ans2);

        return ans1 + ans2;
    }

    int maxSubArray(vector<int>& nums) {
        int l = 0;
        int r = nums.size();
        int ans = 0;
  
        int ans1 = solve(nums,l,(r + l) / 2);
        int ans2 = solve(nums,(r + l) / 2, r);

        a = max(a, ans1 + ans2);

        return a;
    }
};
```

### 题解
- **动态规划**：
	- **思路**：$f[i] = max(f[i - 1],nums[i] + f[i - 1])$
		- 选择使用当前数字
		- 或者不选择使用当前数字
	- **代码**：
``` cpp fold
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int prev = nums[0], max_sum = nums[0];
        for (int i = 1; i < nums.size(); i++) {
            prev = max(nums[i], prev + nums[i]);  // 动态规划递推公式
            max_sum = max(max_sum, prev);  // 更新最大子数组和
        }
        return max_sum;
    }
};
```

