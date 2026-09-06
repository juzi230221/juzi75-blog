---
title: 选科概率计算
published: 2026-09-06
slug: xk
pinned: false
description: 轻计算交给程序
tags: [模拟, C++]
category: 研究
draft: false

---

# 序言

这是一个很简单的项目，甚至算不上项目，只是用程序解决问题。

# 起因

选课初选是抽签的，如下：

![选课界面](.images/xk/1.avif)

因为每刷新一次人数都会变动，如果带数据算每次都要按很多数字，因此写了程序来算。

# 输入格式

按照以下格式将报名数据写入 $in.txt$ ：

```txt
n

m1
a11 b11
a12 b12
a13 b13
...

m2
...
```

其中 $n$ 表示有几个类型的课， m_i 表示每类课选了几个，然后 a_{i,j} 和 b_{i,j} 分别表示这门课程报名人数和招收人数。

# 理论过程

于是我们假设不考虑复杂的机制（意愿顺序的影响、多门课程最多中一门），单纯用人数相除计算抽中的概率，来粗略表征抽中的几率。

有兴趣的读者可以展开讨论更复杂的情况。

通俗的说，一类课抽到的概率就是 1 减去全都不中的概率。

严谨的说，假设一类课选到的概率为 p ，选了 m 门课，每门课的报名人数和招收人数分别为 a_i 和 b_i ，则：

$$ p=1-\prod_{i=1}^m\frac{b_i}{a_i} $$

当然，只是粗略计算，仅供参考。

计算完单门课之后，我们将数据存到 to.txt ，然后接着计算这几类课中抽中几个各自的概率，也就是不同类之间的排列组合。此处不展开，详见程序。

然后我们把结果输出到 out.txt ，稍微排版一下，得到结果。

# 程序实现

计算某类课：

```cpp
#include<bits/stdc++.h>
using namespace std;
int m,n,a[7][2];
double p;
int read(){//fast read,not necessary
	int x=0,f=0;
	char c=getchar();
	while(c<'0'||c>'9'){
		if(c=='-') f=1;
		c=getchar();
	}
	while(c>='0'&&c<='9') x=(x<<1)+(x<<3)+(c^48),c=getchar();
	return f?-x:x;
}
int main(){
	freopen("in.txt","r",stdin);
	freopen("to.txt","w",stdout);
	m=read();
	cout<<m<<endl;
	while(m--){
		n=read();
		for(int i=1;i<=n;++i) a[i][0]=read(),a[i][1]=read();
		p=1;
		for(int i=1;i<=n;++i) p*=(double)(a[i][0]-a[i][1])/a[i][0];
		cout<<1-p<<" ";
	}
	return 0;
}
```

计算综合概率：

```cpp
#include<bits/stdc++.h>
using namespace std;
int n,op[7];
double ans[7],a[7];
void dfs(int p,int cnt){
	if(p>=n){
		double tt=1;
		for(int i=1;i<=n;++i) tt*=(op[i]?a[i]:(1-a[i]));
		ans[cnt]+=tt;
		return ;
	}
	op[p+1]=0;
	dfs(p+1,cnt);
	op[p+1]=1;
	dfs(p+1,cnt+1);
}
int main(){
	freopen("to.txt","r",stdin);
	freopen("out.txt","w",stdout);
	cin>>n;
	cout<<"通识\t\t科光\t\t美育\t\t体育\n";
	for(int i=1;i<=n;++i) cin>>a[i];
	for(int i=1;i<=n;++i) cout<<a[i]<<"\t";
	cout<<"\n\n";
	dfs(0,0);
	for(int i=0;i<=n;++i) cout<<"= "<<i<<" : "<<ans[i]<<"\n";
	cout<<"\n";
	for(int i=n-1;i>=0;--i) ans[i]+=ans[i+1];
	for(int i=0;i<=n;++i) cout<<">= "<<i<<" : "<<ans[i]<<"\n";
	cout<<"\n";
	cout<<"科光和美育至少一个 : "<<1-(1-a[2])*(1-a[3])<<"\n";
	cout<<"\n";
	cout<<"科光和美育都中 : "<<a[2]*a[3]<<"\n";
	cout<<"\n";
	cout<<"通识和科光和美育至少一个 : "<<1-(1-a[1])*(1-a[2])*(1-a[3])<<"\n";
	return 0;
}
```

# 输出结果

初选结束时，我的数据是这样的：

```txt
in.txt

4

4
133 20
399 30
670 120
459 30

3
421 120
895 160
707 160

3
864 185
1063 185
1063 185

3
53 32
180 32
76 32
```

```txt
out.txt

通识		科光		美育		体育
0.397145	0.545727	0.46386	0.811387	

= 0 : 0.0276936
= 1 : 0.194607
= 2 : 0.391158
= 3 : 0.30497
= 4 : 0.0815717

>= 0 : 1
>= 1 : 0.972306
>= 2 : 0.7777
>= 3 : 0.386541
>= 4 : 0.0815717

科光和美育至少一个 : 0.756446

科光和美育都中 : 0.253141

通识和科光和美育至少一个 : 0.853172

```

# 后记

<!-- 最后，我的课程中选情况如图：

![选科初选结果](.images/xk/2.avif) -->

之后我们再看看结果如何。