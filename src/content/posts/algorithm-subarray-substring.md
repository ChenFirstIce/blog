---
title: "算法笔记：子串与子数组"
date: "2026-04-24"
category: "算法"
tags: ["Algorithm", "Subarray", "LeetCode"]
excerpt: "整理子串、子数组相关题型，包括前缀和与哈希思路。"
draft: false
---
# 板子


# 题目+题解
## [1. 和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/)
#中等 
### 我的解法
- 1：超出时间限制，61 / 93 个通过的测试用例
	- **思路**：
		1. 枚举子串可能出现的长度
		2. 然后再枚举左边界
	- **代码**：
```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        //滑动窗口？如果当前子串的和比较小的话就扩大区间，如果当前串的和比较大的话就缩小区间
        int sum = 0;
        int ans = 0;

        for(int i = 1;i <= nums.size();i++){
            int l = 0;
            while(l <= nums.size() - i){
                sum = accumulate(nums.begin() + l, nums.begin() + l + i, 0);
                if(sum == k){
                    ans++;
                    cout << i <<','<< l;
                }

                l++;
            }
        }
        return ans;
    }
};
```
- 2：超时，但是87 / 93 个通过的测试用例
	- **思路**：在1的版本上增加<mark style="background: #ADCCFFA6;">前缀和</mark>，减少计算子串和的时间
	- **代码**：
```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        //滑动窗口？如果当前子串的和比较小的话就扩大区间，如果当前串的和比较大的话就缩小区间
        int sum = 0;
        int ans = 0;
        vector<int> p(nums.size() + 1, 0);//从下标为1开始

        for(int i = 0;i < nums.size();i++){
            p[i + 1] = p[i] + nums[i];
            if(nums[i] == k) ans++;    
        }
        for(int i = 2;i <= nums.size();i++){
            int l = 0;
            while(l <= nums.size() - i){
                sum = p[i + l] - p[l];
                if(sum == k){
                    ans++;
                    //cout << i <<','<< l;
                }
                l++;
            }
        }
        return ans;
    }
};
```

### 题解
- **思路**：前缀和 + 哈希表优化
	1. 当前题目的本质是去找：`nums[l] + ... + nums[r] = k` $\rightarrow ^{换成前缀和}$ ：`pre[r] - pre[l-1] = k` $\rightarrow$ `pr[l-1] = pre[r] - k`
	2. 向前一直求前缀和，然后在区间`[0,r - 1]`中找到某个前`l - 1`个数的前缀和，使得`pre[r, l - 1] = k`
	3. 其实就是再找[[哈希#1. 两数之和：哈希]]
	4. 非常巧妙的把<mark style="background: #ADCCFFA6;">多个数之和换成两数之和</mark>
- **代码**：
```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> cnt;
        cnt[0] = 1;   // 前缀和为 0，初始出现 1 次

        int sum = 0;  // 当前前缀和
        int ans = 0;  // 答案

        for (int x : nums) {
            sum += x;              // 当前前缀和
            ans += cnt[sum - k];   // 查找历史上有多少个前缀和 = sum-k
            cnt[sum]++;            // 记录当前前缀和
        }

        return ans;
    }
};
```

## [2. 滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/)
#困难 

>[!NOTE]
>1. `deque`是双端队列，`push_back`,`pop_front`
>2. `str.find()`返回的是**下标**

### 我的题解
- 1：暴力，完成但是超时
	- **思路**：
		1. 因为窗口的长度是固定的，所以直接循环就行
		2. 最大值用优先队列（大根堆）给出就可以
		3. 没有复用优先队列，每次都是3进3出
	- **代码**：
```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        priority_queue<int> pq;
        vector<int> ans;
        int index = 0;

        for(int i = 0 ;i <= nums.size() - k;i++){
            while(index < k){
                pq.push(nums[i + index]);
                index++;
            }
            
            int x = pq.top();
            ans.push_back(x);
            index = 0;
            
            //这个地方没有复用优先队列，每次都是3进3出
            while(!pq.empty()){
                pq.pop();
            }
        }
        return ans;
    }
};
```

### 题解
- **优先队列**：复用版本
	- **思路**：
		1. 要<mark style="background: #ABF7F7A6;">复用优先队列</mark> $\rightarrow$ 这个数是否在窗口 $\rightarrow$ 存储这个<mark style="background: #ABF7F7A6;">数的下标</mark>
		2. 如果根（最大的数）不在窗口就弹出
	- **代码**：
```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        int n = nums.size();
        priority_queue<pair<int, int>> q;
        
        for (int i = 0; i < k; ++i) {
            q.emplace(nums[i], i);
        }

        vector<int> ans = {q.top().first};
        for (int i = k; i < n; ++i) {
            q.emplace(nums[i], i);
            while (q.top().second <= i - k) {
                q.pop();
            }

            ans.push_back(q.top().first);
        }

        return ans;
    }
};
```
- **单调队列**：
	- **思路**：
		1. <mark style="background: #ABF7F7A6;">单调</mark>表现在两个方面：
			1. `deque`**存储下标**：下标在队列中是单调的；
			2. **每次弹出较早进入且较小的数字**：保证`nums[q[0]] < nums[q[1]] < nums[q[2]] < ...`
		2. <mark style="background: #ABF7F7A6;">滑动窗口</mark>表现在：每次找答案前都要删掉不在当前窗口中的下标。因为该下标一定是较早进入的，所以可以直接从队列的头开始查
	- **代码**：
```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        int n = nums.size();
        deque<int> q;//单调队列存储的是下标
		
		//先处理第一个窗口，得到第一个窗口的最大值
        for (int i = 0; i < k; ++i) {
            while (!q.empty() && nums[i] >= nums[q.back()]) {
                q.pop_back();
            }
            q.push_back(i);
        }

        vector<int> ans = {nums[q.front()]};
        
        //窗口开始往后移动
        for (int i = k; i < n; ++i) {
            while (!q.empty() && nums[i] >= nums[q.back()]) {//每次都把比当前数字小的弹出队列
                q.pop_back();
            }
            
            q.push_back(i);
            
            //然后删掉不在窗口中的数
            while (q.front() <= i - k) {
                q.pop_front();
            }
            ans.push_back(nums[q.front()]);
        }
        
        return ans;
    }
};
```

## [3. 最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/)
#困难
### 我的解法
- 1：完全搞错题目的意思了，我以为只要覆盖就行， 但是要去出现的次数也应当大于等于目标串`t`
	- **思路**：
	- **代码**：
```cpp
class Solution {
public:
    string minWindow(string s, string t) {
        deque<int> q;//但是这个结构不符合！！！
        string str = "";

        int len = 0;

        //单调存储被覆盖的字母的下标
        //找到所有覆盖后把第一个被覆盖的弹出，并重新寻找该字母
        if(s.length() < t.length()) return "";

        for(int i = 0;i < t.length();i++){
            auto it = s.find(t[i]);
            
            if(it != string::npos){
                q.push_back(it);
            }else{
                return "";
            }
        }

        len = q.back() - q.front() + 1;
        str = s.substr(q.front(),len);

        for(int i = t.length();i < s.length();i++){
            //获得当前最靠前的覆盖的字母以及位置
            char c = s[q.front()];
            //重新找这个字母的位置（）一定比当前位置靠后，没有说明str是最终结果
            auto it = s.find(c, q.front() + 1);
            if(it == string::npos) return str;
            
            //找到就放进去
            q.pop_front();
            q.push_back(it);
  
            //找长度最小的子串
            if(len > q.back() - q.front() + 1){
                len = q.back() - q.front() + 1;
                str = s.substr(q.front(), len);

            }

            cout << q.front()  << ' ' << q.back() << ' ' << str << ' ';
        }

        return str;
    }
};
```

### 题解
- **滑动窗口+哈希表**：
	- **思路**：
		1. 两个<mark style="background: #ABF7F7A6;">哈希表</mark>分别维护
			1. **<mark style="background: #FF5582A6;">不变量：</mark>`t`中每个字符出现了多少次；
			2. `s`中每个字符出现多少次
		2. 维护<mark style="background: #ABF7F7A6;">滑动窗口</mark>的左右边界
			1. 右边界：当窗口还不合法时，向右扩张
			2. 左边界：当窗口合法时，缩短窗口
	- **代码**：
```cpp
class Solution {
public:
    string minWindow(string s, string t) {
        unordered_map<char, int> need, window;
        //不变量：先确定t的字符出现频次
        for (char c : t) {
            need[c]++;
        }

        int left = 0, right = 0;
        int valid = 0;  // 满足 need 的字符种类数
        int start = 0, len = INT_MAX;

        while (right < s.size()) {
            char c = s[right];
            right++;

            if (need.count(c)) {
                window[c]++;
                if (window[c] == need[c]) {//只有数量符合时才可以
                    valid++;
                }
            }
			
			//当前出现的字符都覆盖了
            while (valid == need.size()) {
	            //判断是否可更新
                if (right - left < len) {
                    start = left;
                    len = right - left;
                }
				
				//窗口合法，所以左边界缩短
                char d = s[left];
                left++;
				
				//如果是t中的字符的话就变化当前数量
                if (need.count(d)) {
	                //如果之前是一样的，说明现在平衡被打破
                    if (window[d] == need[d]) {
                        valid--;
                    }
                    window[d]--;
                }
            }
        }

        return len == INT_MAX ? "" : s.substr(start, len);
    }
};
```

