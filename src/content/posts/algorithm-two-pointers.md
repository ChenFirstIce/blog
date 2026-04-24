---
title: 算法笔记：双指针
date: 2026-04-24
category: 算法
tags: ["Algorithm", "Two-Pointers", "LeetCode"]
excerpt: 整理双指针常见题型、同向指针、对向指针和相关 LeetCode 题解。
draft: false
---
| 题目特征                | 应该想到的双指针              |
| ------------------- | --------------------- |
| 原地修改数组、移动元素、删除元素、去重 | **同向双指针**             |
| 左右边界一起决定答案，区间不断缩小   | **对向双指针**             |
| 固定一个数，剩下区间找两数       | **排序 + 固定一个 + 对向双指针** |
| 当前位置答案取决于左右两边的信息    | **左右逼近 + 维护边界值**      |
| 链表中点、判环、倒数第 k 个     | **快慢指针**              |

# 板子
## 1.同方向双指针板子
- **适用题型**
	- 把满足条件的元素“挪到前面”
	- 原地删除 / 压缩数组
	- 移动零
	- 有序数组去重
- **核心思想**：`right` 负责扫描，`left` 负责维护“下一个该放结果的位置”。
- **模板**：
```cpp
// 1) 同向双指针：扫描 + 放置
int left = 0;
for (int right = 0; right < n; right++) {
    if (满足条件) {
        swap(nums[left], nums[right]); // 或 nums[left] = nums[right]
        left++;
    }
}
```

## 2.对向双指针总板子
- **适用题型**：
	- 数组有序，找两数和
	- 区间左右收缩
	- “答案和左右边界有关”
	- 盛最多水的容器
- **核心思想**：
	- `left` 在左，`right` 在右。  
	- 每次根据条件，**只移动一个指针**，缩小搜索区间。
- **模板**：
```cpp
// 2) 对向双指针：左右夹逼
int left = 0, right = n - 1;
while (left < right) {
    if (满足条件) {
        // 更新答案
    }
    if (该移动左边) left++;
    else right--;
}
```

## 3.固定一个数+对向双指针板子
- **适用题型**：
	- 三数之和
	- 四数之和
	- kSum的基础模型
- **核心思想**：
	- 先排序
	- 固定第一个数 `i`，剩下区间 `[i+1, n-1]` 变成一个“两数和”问题。
- **三数之和模板**：
```cpp
// 3) 三数之和：排序 + 固定一个 + 对向双指针
sort(nums.begin(), nums.end());
for (int i = 0; i < n; i++) {
    if (i > 0 && nums[i] == nums[i - 1]) continue;
    int left = i + 1, right = n - 1;
    while (left < right) {
        int sum = nums[i] + nums[left] + nums[right];
        if (sum == target) {
            // 记录答案
            left++;
            right--;
            while (left < right && nums[left] == nums[left - 1]) left++;
            while (left < right && nums[right] == nums[right + 1]) right--;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
}
```

## 4.接雨水双指针板子
- **适用题型**：
	- 左边最大值 / 右边最大值决定当前位置答案
	- 每次可以确定“哪边是短板”
- **核心思想**：
	- 维护：
		- `leftMax`：左边见过的最高柱子
		- `rightMax`：右边见过的最高柱子
	- 如果 `leftMax < rightMax`，说明当前左边这一格能接多少水，已经可以确定；  
	- 反之确定右边。这个就是你前面问过的“为什么右边界可以直接从 `n-1` 开始”的根本原因。
- **模板**：
```cpp
// 4) 接雨水：维护左右最大值
int left = 0, right = n - 1;
int leftMax = 0, rightMax = 0, ans = 0;
while (left < right) {
    leftMax = max(leftMax, height[left]);
    rightMax = max(rightMax, height[right]);
    if (leftMax < rightMax) {
        ans += leftMax - height[left];
        left++;
    } else {
        ans += rightMax - height[right];
        right--;
    }
}
```

## 5.快慢指针板子
- **适用题型**：
	- 链表找中点
	- 判断环
	- 删除链表倒数第 k 个结点
	- 数组里快慢覆盖
- **链表找中点板子**：
```cpp
ListNode* slow = head;
ListNode* fast = head;

while (fast && fast->next) {
    slow = slow->next;
    fast = fast->next->next;
}
// slow 就是中点
```
- **判断链表有环板子**：
```cpp
ListNode* slow = head;
ListNode* fast = head;

while (fast && fast->next) {
    slow = slow->next;
    fast = fast->next->next;
    if (slow == fast) return true;
}
return false;
```

--- 
# 性质

---
# 题目+解法
> 来自leetcode 100热题

### [1. 移动零](https://leetcode.cn/problems/move-zeroes/description/?envType=study-plan-v2&envId=top-100-liked)
#简单
>[!NOTE]
>要先判断下标是否越界再判断数组元素的大小，否则会出现不合法的情况
>`vector`交换可以使用函数`swap()`

#### 我的解法
- 1：3ms
	- 思路：
		1. $i$ 表示最前面的0元素的下标；$j$ 表示非0元素（也表示非0元素队列的队尾元素）
		2. 当 $i < j$ 时，表示区间 $[0,j]$ 之间当前有0元素，所以要进行交换
	- 代码：
		```cpp
		class Solution {
		public:
		    void moveZeroes(vector<int>& nums) {
		        int i = 0;//表示sub[i,j]最靠前的0
		        int j = 1;//表示sub[0,j]的最后一个非0数字
		        //这里注意要先判断下标是否越界再判断数组元素的大小，否则会出现不合法的情况
		
		        while(i < nums.size() && nums[i] != 0){
		            i++;
		        }
		        if(i == nums.size()) return;
		        //先把0放到最后
		        for(;j < nums.size();j++){
		            //nums[j] == 0不用管直接往前走
		            if(nums[j] != 0 && i < j){//要注意i和j的大小关系，只有当最前的0元素下标比非0元素的下标小的时候才能说明0不在队尾
		                int tmp = nums[i];
		                nums[i] = nums[j];
		                nums[j] = tmp;
		                while(nums[i] != 0 && i < nums.size()){
		                    i++;
		                }
		            }
		        }
		    }
		};
		```
- 2：0ms，主要是使用了交换函数`swap()`，时间复杂度减小了
	- 代码：和上面的尝试没什么区别
		```cpp
		class Solution {
		public:
		    void moveZeroes(vector<int>& nums) {
		        int i = 0;//表示sub[i,j]最靠前的0
		        int j = 1;//表示sub[0,j]的最后一个非0数字
		        //这里注意要先判断下标是否越界再判断数组元素的大小，否则会出现不合法的情况
		        while(i < nums.size() && nums[i] != 0){
		            i++;
		        }
		
		        if(i == nums.size()) return;
		
		        for(;j < nums.size();j++){
		            if(nums[j] != 0 && i < j){
		                swap(nums[i],nums[j]);//主要是这里改变了
		                while(nums[i] != 0 && i < nums.size()){
		                    i++;
		                }
		            }
		        }
		    }
		};
		```
#### 题解
- 思路：
	1. `right`表示当前扫描到的位置；`left`表示下一个应该放非0的位置
	2. 题解是在找可以往前放的数，而不是找需要放在后面的0
	3. **不变量**：
		- `nums[0..left-1]`：已经处理好的非 0 元素
		- `nums[left..right-1]`：已经扫描过，但这些位置里是“空出来的 0 区域”或者待整理区
- 代码：
```cpp
class Solution {
public: 
	void moveZeroes(vector<int>& nums) {
		int n =nums.size(), left=0, right=0;
		while (right < n) {
			if (nums[right]){
				swap(nums[left], nums[right]);
				left++; 
			}
			right++; //如果扫到0，就跳过
		} 
	} 
};
```

### [2. 盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/)
#中等
#### 我的解法
- 1：没有写出来，只有一些思路，这种越远越好的题不能用对向指针
	- 我记得好像可以用队列来做？
#### 题解
- 思路：
	1. **两个条件：**$min(height[r],height[l]) * (r - l)$
		- **越远越好**  $(r - l)$ ：选择最大的 $[i, j]$ 范围，所以这个双指针是==**对向移动**==的
		- **越高越好** $min(height[r],height[l])$ ： 每次试探移动 $height[i]$ 和 $height[j]$ 里面较小的指针
	 2. **最终答案的选择：** 选择面积最大的，所以==**面积作为选择答案的标准**==
- 代码：
	```cpp
	class Solution {
	public:
	    int maxArea(vector<int>& height) {
	        int l = 0;
	        int r = height.size() - 1;
	        int ans = 0;
	        while(l < r){
	            int sq = min(height[r],height[l]) * (r - l);
	            ans = max(ans, sq);
	            
	            if(height[l] < height[r]) l++;
	            else r--;
	        }
	        return ans;
	    }
	};
	```

## [3. 三数之和](https://leetcode.cn/problems/3sum/)
#中等
#### 我的解法
- 1：写出来了，但是超时，题解过311/316
	- 思路：
		1. 这里是想使用到`vector`的`find(begin,end,value)`函数，能够实现查找，所以我们只要使用双指针查找两个数就行，剩下的交给`find`
		2. 处理查重主要的两个部分：
			- 对原数组进行排序，保证最后`insert`进`set`的数组是有序的
			  > 这里的sort必须做，不然set无法查重
			- 使用`set`对结果进行查重
	- 代码：
		```cpp
		class Solution{
		
		public:
		
		    vector<vector<int>> threeSum(vector<int>& nums) {
		        vector<vector<int>> ans;
		        set<vector<int>> mp;
		        int r = nums.size() - 1;
		        int l = 0;
		        int index = 0;
		        //这里的sort必须做，不然set无法查重
		        sort(nums.begin(),nums.end());
		
		        for(int l = 0;l < nums.size();l++){
		            //cout << l <<' ';
		            for(int r = l + 1;r < nums.size();r++){
		                auto it = find(nums.begin() + l + 1, nums.begin() + r, 0 - nums[l] - nums[r]);
		                if(it != nums.begin() + r){
		                    mp.insert({nums[l],nums[r],*it});
		                }
		            }
		            while(l < nums.size() - 1 && nums[l] == nums[l + 1]) l++;
		        }
		        
		        for(auto m:mp){
		            ans.push_back(m);
		        }
		        return ans;
		    }
		};
		```

#### 题解
- **思路**：
- **代码**：
	``` cpp fold
	class Solution {
	public:
	    vector<vector<int>> threeSum(vector<int>& nums) {
	        int n = nums.size();
	        vector<vector<int>> ans;
	        
	        sort(nums.begin(), nums.end());
	        
	        // 枚举 a
	        for (int first = 0; first < n; ++first) {
	            // 需要和上一次枚举的数不相同
	            if (first > 0 && nums[first] == nums[first - 1]) {
	                continue;
	            }
	            // c 对应的指针初始指向数组的最右端
	            int third = n - 1;
	            int target = -nums[first];
	            // 枚举 b
	            for (int second = first + 1; second < n; ++second) {
	                // 需要和上一次枚举的数不相同
	                if (second > first + 1 && nums[second] == nums[second - 1]) {
	                    continue;
	                }
	                // 需要保证 b 的指针在 c 的指针的左侧
	                while (second < third && nums[second] + nums[third] > target) {
	                    --third;
	                }
	                // 如果指针重合，随着 b 后续的增加
	                // 就不会有满足 a+b+c=0 并且 b<c 的 c 了，可以退出循环
	                if (second == third) {
	                    break;
	                }
	                if (nums[second] + nums[third] == target) {
	                    ans.push_back({nums[first], nums[second], nums[third]});
	                }
	            }
	        }
	        return ans;
	    }
	};
	```


## [4. 接雨水](https://leetcode.cn/problems/trapping-rain-water/)
#困难
### 我的解法
- 1：限制时间没有写出来，但是有思路
	- 思路：
```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        int sum = 0;//接到的水
        /*
        规律：
        1.求一个区间[l,r],这个区间里的数值比l和r小。
        2.要求下一个区间的分界线的判断是：r比前一个数大()，比后一个数小
        */
        for(int l = 0;l < n;l++){
            vector<int> tmp;
            for(int r = l + 1;r < n - 1;r++){
               /*
                if(j - i > 1 && height[r - 1] < height[r] < height[r + 1]){
                    sum += tmp中的每一个元素减去min(r,l)再求和;
                    i = j;
                }
                */
            }
        }
        return sum;
    }
};
```

### 题解
- **直觉**:
	- **思路**：遍历每一个位置，找这个位置所在的区间 $[leftmax,rightmax]$
	  > 现找左右最高
		- 对于每一个位置 `i`：
			- 往左找，找到左边最高柱子 `leftMax`
			- 往右找，找到右边最高柱子 `rightMax`
			- 当前位置能接水：`ans +=min(leftMax, rightMax) - height[i]` 
	- **时间复杂度**：$O(n^2)$
	- **代码**：
```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        int ans = 0;

        for (int i = 0; i < n; i++) {
            int leftMax = 0, rightMax = 0;

            // 找左边最高
            for (int l = 0; l <= i; l++) {
                leftMax = max(leftMax, height[l]);
            }

            // 找右边最高
            for (int r = i; r < n; r++) {
                rightMax = max(rightMax, height[r]);
            }

            ans += min(leftMax, rightMax) - height[i];
        }

        return ans;
    }
};
```
- **动态规划**：
	- **思路**：根据上述优化，既然每次都要求这个区间的`leftmax`和`rightmax`那不如先预处理将值存起来。
	  > 提前存好左右最高
		- **数据结构**：数组
		- `leftmax`：从左往右遍历
			- 到当前位置为止的最高值
			- 要么是前面已经有的最高值
			- 要么就是当前柱子更高
		-  `rightmax`：从右往左遍历
			- 到当前位置为止的最高值
			- 要么是前面已经有的最高值
			- 要么就是当前柱子更高
	- **时间复杂度**：$O(n)$
	- **代码**：
```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        if (n == 0) return 0;

        vector<int> leftMax(n), rightMax(n);

        leftMax[0] = height[0];
        for (int i = 1; i < n; i++) {
            leftMax[i] = max(leftMax[i - 1], height[i]);
        }

        rightMax[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--) {
            rightMax[i] = max(rightMax[i + 1], height[i]);
        }

        int ans = 0;
        for (int i = 0; i < n; i++) {
            ans += min(leftMax[i], rightMax[i]) - height[i];
        }

        return ans;
    }
};
```
- **单调栈**：
	- **思路**：
	- **代码**：
- **双指针**：
	- **思路**：只要短板确定了就可以进行接水量的计算，反正长板都可以接住
		1. `leftmax < rightmax`说明短板是左边，右边有长板可以接住
		2. `leftmax >= rightmax`说明短板是右边，左边有长板子可以接住
	- **代码**：
```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        int left = 0, right = n - 1;
        int leftMax = 0, rightMax = 0;
        int ans = 0;

        while (left < right) {
            leftMax = max(leftMax, height[left]);
            rightMax = max(rightMax, height[right]);

            if (leftMax < rightMax) {
                ans += leftMax - height[left];
                left++;
            } else {
                ans += rightMax - height[right];
                right--;
            }
        }

        return ans;
    }
};
```
