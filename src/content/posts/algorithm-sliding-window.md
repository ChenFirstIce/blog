---
title: "算法笔记：滑动窗口"
date: "2026-04-24"
category: "算法"
tags: ["Algorithm", "Sliding Window", "LeetCode"]
excerpt: "整理滑动窗口题型，包括无重复字符最长子串等例题与题解。"
draft: false
---
# 题目+题解
## [1. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)
#中等 
### 我的解法
- 1：暴力解法，899ms
	- **思路**：遍历
	- **代码**：
```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int n = s.length();
        int len = 0;
        int i, j;
        
        for(i = 0 ; i < n ; i++){
            unordered_map<char, int> c;
            c[s[i]] = 1;
            
            for(j = i + 1 ; j < n ; j++){
                if(c[s[j]]) break;
                else{
                    c[s[j]] = 1;
                }
            }

            len = max(len, j - i);
        }
        return len;
    }
};
```

### 题解
- **滑动窗口**：
	- **思路**：
		1. **数据结构**：哈希表
		2. **方法**：
			1. 从第一个字符开始，每次遇到没有重复出现的字母就让区间包含该字母
			2. 如果下一个字符与区间内的字母重复，则收缩区间-->使得区间内刚好不包含该字符
			3. 过程中记录区间长度
	- **代码**：
```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> mp;
        int len = 0;
        int l = 0;
        int r = 0;
        int n = s.length();

        while(r < n){
            if(mp.find(s[r]) == mp.end()){
                mp[s[r]] = 1;
                len = max(len, r - l + 1);
                r++;
            }else{
                while(l < r && mp.find(s[r]) != mp.end()){
                    mp.erase(s[l]);
                    l++;
                }
            }
        }
  
        return len;
    }
};
```

## [2. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)
#中等 
>[!NOTE] 
>`vector`支持`==`比较，时间复杂度是$O(n)$
### 我的题解
- 1：狠狠超时，34 / 65个例子
	- **思路**：暴力解法
	- **时间复杂度**：$O(n * (m\log(m)))$
	- **代码**：
```cpp
class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        int l = 0;
        int r = 0;
        vector<int> ans;
        sort(p.begin(),p.end());

        while(l < s.length()){
            string str = s.substr(l, p.length());
            sort(str.begin(),str.end());
            if(str == p) ans.push_back(l);
            l++;
        }
  
        return ans;
    }
};
```

### 题解
- **滑动窗口**：
	- **思路**：维护一个<mark class="hltr-red">固定长度</mark>`=plen`窗口内的字符频率，看它是否和 `p` 的频率一致。
		1. 分别记录字符在字符串`s`和`p`中出现的频次
		   > 从比较窗口中的字串`str`优化为**比较窗口中字母出现的频次**。因为顺序并不重要。
		2. 维护固定长度的窗口 $[i,i+plen]$，判断字符在`s[i,i+plen]`和在`p`中出现的频次是否一致
		3. 每次移动边界
	- **代码**：
```cpp
class Solution { 
public: 
	vector<int> findAnagrams(string s, string p) { 
		int sLen = s.size(), pLen = p.size(); 
		if (sLen < pLen) { 
			return vector<int>(); 
		} 
		vector<int> ans; 
		vector<int> sCount(26); 
		vector<int> pCount(26); 
		
		for (int i = 0; i < pLen; ++i) {
			 ++sCount[s[i] - 'a']; ++pCount[p[i] - 'a']; 
		} 
		
		if (sCount == pCount) { 
			ans.emplace_back(0); 
		} 
		
		for (int i = 0; i < sLen - pLen; ++i) {
			--sCount[s[i] - 'a']; 
			++sCount[s[i + pLen] - 'a']; 
			if (sCount == pCount) { 
				ans.emplace_back(i + 1); } 
		} 
		return ans; 
	} 
}; 
```
- **优化的滑动窗口**：
	- **思路**：维护一个变量`differ`记录当前字串中字符频次不一样的个数
		> 因为每次窗口滑动只有边界的两个字符的频次会变化
	- **代码**：
		1. 字符数组频次`count`记录的是`s`和`p`字符出现的频次的差值
		2. 维护`differ`是
			- 左边界前移后，该字符的个数从不同到相同-->`differ`减少/从相同到不同-->`differ`增大
			- 右边界前移同理
		3. 只要看左右边界出去和进来的字符对局部信息`differ`和全局信息`count`的变化即可
```cpp
class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        int sLen = s.size(), pLen = p.size();
        
        if (sLen < pLen) {
            return vector<int>();
        }

        vector<int> ans;
        vector<int> count(26);
        
        for (int i = 0; i < pLen; ++i) {//判断s和p有多少频次不同的字母
            ++count[s[i] - 'a'];
            --count[p[i] - 'a'];
        }

        int differ = 0;
        
        for (int j = 0; j < 26; ++j) {
            if (count[j] != 0) {
                ++differ;
            }
        }

        if (differ == 0) {
            ans.emplace_back(0);
        }

        for (int i = 0; i < sLen - pLen; ++i) {
        //左边界i
            if (count[s[i] - 'a'] == 1) {  // 窗口中字母 s[i] 的数量与字符串 p 中的数量从不同变得相同
                --differ;
            } else if (count[s[i] - 'a'] == 0) {  // 窗口中字母 s[i] 的数量与字符串 p 中的数量从相同变得不同
                ++differ;
            }
            --count[s[i] - 'a'];
  
		//有边界len+i
            if (count[s[i + pLen] - 'a'] == -1) {  // 窗口中字母 s[i+pLen] 的数量与字符串 p 中的数量从不同变得相同
                --differ;
            } else if (count[s[i + pLen] - 'a'] == 0) {  // 窗口中字母 s[i+pLen] 的数量与字符串 p 中的数量从相同变得不同
                ++differ;
            }
            ++count[s[i + pLen] - 'a'];

            if (differ == 0) {
                ans.emplace_back(i + 1);
            }
        }

        return ans;
    }
};
```

