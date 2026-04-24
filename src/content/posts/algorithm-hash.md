---
title: "算法笔记：哈希"
date: "2026-04-24"
category: "算法"
tags: ["Algorithm", "Hash", "LeetCode"]
excerpt: "整理哈希表常见应用场景、模板题和对应 C++ 解法。"
draft: false
---
# 板子

### 1. **寻找重复元素**

**题目**: 给定一个整数数组，找出其中所有出现超过一次的元素。

**哈希应用**: 使用哈希表来统计每个元素的出现次数，再找出出现超过一次的元素。

**解法示例**:

```c++
class Solution {
public:
    vector<int> findDuplicates(vector<int>& nums) {
        unordered_map<int, int> count;
        vector<int> result;
        for (int num : nums) {
            count[num]++;
            if (count[num] == 2) {
                result.push_back(num);
            }
        }
        return result;
    }
};
```

### 2. **四数之和**

**题目**: 给定一个包含 `n` 个整数的数组 `nums`，判断是否存在四个元素 `a`, `b`, `c`, `d`，使得 `a + b + c + d = target`。找出所有满足条件且不重复的四元组。

**哈希应用**: 可以使用哈希表存储数字的配对和，以便快速查找可能的四个元素组合。

**解法示例**:

```c++
class Solution {
public:
    vector<vector<int>> fourSum(vector<int>& nums, int target) {
        unordered_map<int, vector<pair<int, int>>> twoSumMap;
        vector<vector<int>> result;
        sort(nums.begin(), nums.end());
        int n = nums.size();

        // 存储所有可能的两两和
        for (int i = 0; i < n - 1; ++i) {
            for (int j = i + 1; j < n; ++j) {
                twoSumMap[nums[i] + nums[j]].push_back({i, j});
            }
        }

        // 查找配对
        for (int i = 0; i < n - 1; ++i) {
            for (int j = i + 1; j < n; ++j) {
                int complement = target - (nums[i] + nums[j]);
                if (twoSumMap.find(complement) != twoSumMap.end()) {
                    for (auto& p : twoSumMap[complement]) {
                        if (p.first > j) {  // 避免重复的组合
                            result.push_back({nums[i], nums[j], nums[p.first], nums[p.second]});
                        }
                    }
                }
            }
        }
        return result;
    }
};
```

### 3. **找到数组中出现次数最多的元素**

**题目**: 给定一个整数数组，返回出现次数最多的元素。如果有多个元素出现次数相同，返回其中任意一个。

**哈希应用**: 使用哈希表来统计每个元素的出现频率，然后找出出现次数最多的元素。

**解法示例**:

```c++
class Solution {
public:
    int majorityElement(vector<int>& nums) {
        unordered_map<int, int> count;
        for (int num : nums) {
            count[num]++;
        }

        int maxCount = 0, majorityElement;
        for (auto& entry : count) {
            if (entry.second > maxCount) {
                maxCount = entry.second;
                majorityElement = entry.first;
            }
        }
        return majorityElement;
    }
};
```

### 4. **子数组和为 `K`**

**题目**: 给定一个整数数组 `nums` 和一个整数 `K`，找出和为 `K` 的连续子数组的个数。

**哈希应用**: 使用哈希表存储前缀和，并通过查找当前前缀和与目标值的差值来快速计算满足条件的子数组。

**解法示例**:

```c++
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> prefixSumCount;
        prefixSumCount[0] = 1; // 初始时，前缀和为0出现一次
        int currentSum = 0, result = 0;
        for (int num : nums) {
            currentSum += num;
            if (prefixSumCount.find(currentSum - k) != prefixSumCount.end()) {
                result += prefixSumCount[currentSum - k];
            }
            prefixSumCount[currentSum]++;
        }
        return result;
    }
};
```

### 5. **最长子串无重复字符**

**题目**: 给定一个字符串 `s`，请你找出其中不含有重复字符的最长子串的长度。

**哈希应用**: 使用滑动窗口技巧，利用哈希表记录字符的最新索引，快速确定子串的边界。

**解法示例**:

```c++
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> charIndexMap;
        int maxLength = 0;
        int left = 0;
        for (int right = 0; right < s.size(); ++right) {
            if (charIndexMap.find(s[right]) != charIndexMap.end()) {
                left = max(left, charIndexMap[s[right]] + 1); // 更新左边界
            }
            charIndexMap[s[right]] = right;
            maxLength = max(maxLength, right - left + 1);
        }
        return maxLength;
    }
};
```

### 6. **最小覆盖子串**

**题目**: 给定一个字符串 `s` 和一个字符串 `t`，找出 `s` 中包含 `t` 所有字符的最小子串。

**哈希应用**: 使用滑动窗口技巧，利用哈希表存储 `t` 的字符频率，再通过窗口调整来找到最小覆盖子串。

**解法示例**:

```c++
class Solution {
public:
    string minWindow(string s, string t) {
        unordered_map<char, int> targetCount, windowCount;
        for (char c : t) {
            targetCount[c]++;
        }
        int left = 0, right = 0, valid = 0, minLength = INT_MAX;
        int start = 0;
        
        while (right < s.size()) {
            char c = s[right];
            right++;
            if (targetCount.find(c) != targetCount.end()) {
                windowCount[c]++;
                if (windowCount[c] == targetCount[c]) {
                    valid++;
                }
            }
            
            while (valid == targetCount.size()) {
                if (right - left < minLength) {
                    minLength = right - left;
                    start = left;
                }
                char d = s[left];
                left++;
                if (targetCount.find(d) != targetCount.end()) {
                    if (windowCount[d] == targetCount[d]) {
                        valid--;
                    }
                    windowCount[d]--;
                }
            }
        }
        return minLength == INT_MAX ? "" : s.substr(start, minLength);
    }
};
```


---
# 性质

---
# 题目+解法
> 题单来自leetcode
### 1. 两数之和：哈希

   - ####  我的方法

     - 1：AC成功，75ms

       ```c++
       class Solution {
       public:
           vector<int> twoSum(vector<int>& nums, int target) {
               //dfs 
               vector<int> ans;
               for(int i = 0;i < nums.size();i++){
                   for(int j = i + 1;j < nums.size();j++){
                       if(nums[i] + nums[j] == target){
                           ans.push_back(i);
                           ans.push_back(j);
                           return ans;
                       }
                   }
               }
               return ans;
           }
       };
       ```


   - 题解：0s

     ```c++
     class Solution {
     public:
         vector<int> twoSum(vector<int>& nums, int target) {
             // 哈希表，存储已经遍历过的数字及其下标
             unordered_map<int, int> myMap;
             // 遍历数组
             for (int i = 0; i < nums.size(); ++i) {
                 // 查找是否存在与当前数字配对的目标数
                 auto it = myMap.find(target - nums[i]);
                 // 如果找到，返回两个下标（配对数的下标和当前下标）
                 if (it != myMap.end())
                     return {it->second, i};
                 // 否则，将当前数字及其下标存入哈希表
                 myMap.insert({nums[i], i});
             }
             // 理论上一定存在解，但为了编译通过返回空
             return {};
         }
     };
     ```

### 2. 字母异位词分组：哈希

   > [!NOTE]
   >
   > `emplace_back()`的用法：和`push_back()`差不多，就是`emplace_back()`是直接构造对象不是拷贝，效率更高
   >
   > string类型的`find()`的用法
   >
   > map类型的`find()`的用法，特别是该清楚find查询的是**key**

   - 我的方法：

     - 1：超出时间限制，113/128个用例，不出所料$O(n^3)$时间复杂度会超时:cry:

       - 循环遍历数组->嵌套循环遍历后面的数组->循环计算当前目标串的字母以及个数->循环匹配匹配串的字母是否相同&数量是否对得上->加入到数组ans中
       - 核心：1.嵌套循环搜索得到目标串和匹配串；2.保证字母一致（一个char一个char的遍历）；3.保证个数一致（map存放目标串的字母以及个数）

       ```c++
       class Solution {
       public:
           vector<vector<string>> groupAnagrams(vector<string>& strs) {
               //老办法，直接暴力找
               vector<vector<string>> ans(10004);
               vector<bool> f(strs.size(), 0);//表示当前串已经被匹配
               int index = 0;//表示当前字母异位词的下标
               
               //string类型数组也可以使用sort进行排序
               sort(strs.begin(),strs.end());
               //寻找匹配串
               for(int i = 0;i < strs.size();i++){//目标串
                   if(f[i]) continue;//这个串已经被匹配了
                   
                   f[i] = true;
                   ans[index].push_back(strs[i]);
                   
                   for(int j = i + 1;j < strs.size();j++){//匹配串
                       if(f[j]) continue;//已经被匹配了
                       if(strs[j].length() != strs[i].length()) continue;//不能被匹配
                       
                       unordered_map<char,int> mp;
                       for(auto i:strs[i]){
                           auto it = mp.find(i);
                           if(it == mp.end()) mp[i] = 1;
                           else mp[i]++;
                       }
                       
                       int k;
                       //尝试匹配
                       for(k = 0;k < strs[i].length();k++){
                           //string数组也可以进行find查找，但是返回值比较特别，是npos不是end()
                           //这里不仅能找到而且个数也一样
                           auto it = strs[i].find(strs[j][k]);
                           if(it == string::npos) break;
                           else{
                               mp[strs[j][k]]--;
                               if(mp[strs[j][k]] < 0) break;
                           }
                       }
       
                       bool flag = 1;
                       for(auto m:mp){
                           if(m.second < 0){
                               flag = 0;
                               break;
                           }
                       }
       
                       if(k == strs[i].length() && flag){
                           f[j] = true;//表示被匹配
                           ans[index].push_back(strs[j]);
                       }
                   }
       
                   index++;
               }
               ans.resize(index);//这个resize可以重新放缩数组最外层的大小
       
               return ans;
           }
       };
       ```

     - 2：WA了，但是我感觉我的思路是可以的
       - 使用map存储排序过的字符串，并存与之对应的字符串
       - 使用set存储key
       - 然后再把map存到ans里

       ```c++
       class Solution {
       public:
           vector<vector<string>> groupAnagrams(vector<string>& strs) {
               vector<vector<string>> ans(10004);
               unordered_map<string,int> mp;
               int index = 0;
               
               for(int i = 0 ;i < strs.size();i++){
                   string str = strs[i];
                   sort(str.begin(),str.end());
                   mp[str] = i;
               }
       
               for(int i = strs.size() - 1 ; i >= 0;i--){
                   //返回
                   string str = strs[i];
                   sort(str.begin(),str.end());
                   auto it = mp.find(str);
                   
                   if(it == mp.end()) index++;
                   ans[index].push_back(strs[it->second]);
               }
       
               ans.resize(index);
               return ans;
           }
       };
       ```

       

   - **官方题解：**
     - 排序：
       - 核心：使用哈希表存放**按照字典序排序**后string数组中的所有字符串。
       - 这样就统一了，不需要在做字母的查找匹配，直接以字符串为单位进行查找即可

       ```c++
       class Solution {
       public:
           vector<vector<string>> groupAnagrams(vector<string>& strs) {
               unordered_map<string, vector<string>> mp;
               for (string& str: strs) {
                   string key = str;
                   sort(key.begin(), key.end());
                   mp[key].emplace_back(str);//和我的想法一样，使用map存储排序过的字符串，并存与之对应的字符串
               }
               vector<vector<string>> ans;
               for (auto it = mp.begin(); it != mp.end(); ++it) {。//这里直接使用容器遍历，不用set存储排序后的字符串里
                   ans.emplace_back(it->second);//可以直接把string数组放进二维数组ans里
               }
               return ans;
           }
       };
       ```

### 3. 最长连续序列

   - 我的解法：

     - 1：2317ms

       - 很质朴的暴力解法，就是这样一个一个元素的比较，但是要注意边界情况：1.数组长度的边界；2.ma和len比较大小的边界

       ```c++
       class Solution {
       public:
           int longestConsecutive(vector<int>& nums) {
               int ma = 1;
               int len = 1;
               
               if(nums.size() == 0) return 0;
               else if(nums.size() == 1) return 1;
       
               sort(nums.begin(),nums.end());
               
               for(auto i:nums) cout << i << ' ';
               
               for(int i = 0;i < nums.size() - 1;i++){
                   if(nums[i + 1] == nums[i] + 1) len++;
                   else if(nums[i + 1] == nums[i]) continue;
                   else{
                       ma = max(ma,len);
                       len = 1;
                   }
                  cout << len <<','<<ma <<' ';
               }
               ma = max(ma, len);
               
               /*
               直接不要这一段，因为len一定表示的是最终答案，只是没有机会给到ma
               if(nums[nums.size() - 1] == nums[nums.size() - 2] + 1) {//这个地方的下标要注意啊啊啊啊
                   ma = max(ma,len);
               }
               */
       
               return ma;
           }
       };
       ```

