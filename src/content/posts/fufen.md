---
title: 赋分原理的探索与程序实现
published: 2026-07-06
slug: fufen
pinned: false
description: 探究赋分的机制
tags: [模拟, C++]
category: 研究
draft: false
# image: ./images/Logis/1-0.avif

---

# 项目概述

- 起因
- 赋分规则
- 逆推赋分比率
- 程序实现
- 总结
- 拓展

# 起因

- 学校所买的智学网不包含赋分，看不见赋分，而且排名没分文理
- 自行排总分的时候缺少赋分过程，导致与学校发布排名的差别很大
- 问遍周围人发现没有人干过赋分这件事 ~~，无法白嫖~~ 
- 想要熟悉一下赋分过程
- ~~便于开盒~~ 

# 赋分规则

## 步骤

不论是什么级别（省/市/校）的赋分，都遵循相同的步骤。

我们记：

- 一个学生的原始分为 $O$ ，赋分为 $F$ 
- 所在等级区间的最高原始分为 $O_{upper}$ ，对应赋分上界 $F_{upper}$ 
- 所在等级区间的最低原始分为 $O_{lower}$ ，对应赋分上界 $F_{lower}$ 

赋分的本质是映射，大致步骤：

1. 根据 $O$ 划定等级( $A$ ~ $E$ )
2. 根据所在等级的 $O_{upper}$ 、 $O_{lower}$ 、 $F_{upper}$ 、 $F_{lower}$ ，代入公式进行计算
3. 计算结果四舍五入得到 $F$

注：
1. 每个等级的划分一般按照排名的百分比进行划分，例如 $A$ 划为前 $0\%$ ~ $15\%$
2. 每个等级对应的赋分上下界由相关人员决定，该等级的学生分数的赋分结果将填充该赋分区间

## 分级比例
省份一般会对赋分比例进行公示，例如：
|等级|比例|赋分区间|
|:---:|:---:|:---:|
| A |约 15%|100-86|
| B |约 35%|85-71|
| C |约 35%|70-56|
| D |约 13%|55-41|
| E |约 2%|40-30|

## 约算

值得一提的是，其中出现很多需要约算的地方，而约算的方式我们无从知晓，故需要一些默认处理。

- 计算等级划分排名线：总人数 $\times 15\%$ 可能并非整数，这里我们处理成四舍五入

- 计算等级划分分数线：当这个排名有多人同分时，我们不妨从该排名学生向上下寻找最近的另一分数分界线作为 **等级划分分数线** 

例如下图， $15\%$ 等级分界线离原始分 $59$ ~ $60$ 划分线最近，所以我们向下取 $O_{lower}$ = $60$ ，对应 $F_{lower}$ = $86$ 

![切线](./images/fufen/line.avif)

- 代公式后得到的结果不是整数，我们四舍五入取整数作为赋分分数 $F$

## 公式

$$ \frac{O_{upper}-O}{O-O_{lower}}=\frac{F_{upper}-F}{F-F_{lower}} $$

例如：化学年段最高分 $91$ ， $A$ 线最低分 $60$ 。一个同学考了 $73$ ，代入公式：

$$ \frac{91-73}{73-60}=\frac{100-F}{F-86} $$

按计算器得：$F=91.87≈92$

## 误区

赋分是按照 **分数比例** 给分，而不是排名比例给分

# 逆推赋分比率

## 必要性

> 显然，省市的比率没有什么用，因为我也无法获取到省市级考试大家的成绩。而智学网上只显示了原始分，非常影响手排总分段排（出分前）。
> 年段由于一些原因，会调整赋分比例，只能问得 $A$ 线约 $50\%$ ，因此试图逆推年段比率

## 思路

既然：
- $O$ $\to$ 分级 $\to$ 公式 $\to$ $F$

那么：
- 已知 $F$ $\to$ 所在等级
- 已知 $O$ + $F$ + $F_{upper}$ + $F_{lower}$ $\to$  $O_{upper}$ + $O_{lower}$ 
- $A$ 等级的 $O_{upper}$ 已知，为最高分
- 可依次推得原始分分数线
- 段排/总人数即为大概的比例

我们可以：
1. 获取样本（ $O$ 和对应的 $F$ ）
2. 判断所在等级区间，得出 $F_{upper}$ 和 $F_{lower}$ 
3.  $O_{upper}$ 已知的情况下，公式计算出 $O_{lower}$ 
4. 用“ $O_{lower}$ 所处段排”比上“该科考试总人数”得到百分比

## 举例

例如：化学年段最高分 $91$ ，一个同学考了 $73$ ，赋出来 $92>85$ ，显然 $A$ 。代入公式：

$$ \frac{91-73}{73-O_{lower}}=\frac{100-92}{92-86} $$

按计算器得： $O_{lower}=59.5≈60$

查看：“ $59$ 分对应的段排 $-1$ ”（≥ $60$ 分的人数）为 $383$

化学考试总人数（去掉 $0$ 分）为 $772$

所以 $383/772=49.61\%≈50\%$

可见，计算存在误差，特别是该科人数少的时候。但是 $50\%$ 是个极好的数字，大概率是正确的。与获得的 $A$ 线信息比照也说明算法正确。

# 程序实现赋分

## 实现流程

- 文件读入
- 对于每个赋分科目：排序，计算有效人数，计算排名切线与分数切线，并分别代公式
- 善后：物理类/历史类分流，文件输出

## 代码实现

```cpp
#include<bits/stdc++.h>
#include<conio.h>
using namespace std;
struct Stu{
	int id;
	string name;
	//0 [1,9]
	double origin[12],last[12];
}a[1145],li[1145],wen[1145];
int n,nli,nwen,nt,t,cut[8],p,fs[]={0,100,85,70,55,40},fx[]={0,86,71,56,41,30};
double rate[8]={0,0.50,0.87,0.92,0.97,1.00},fup,fdown,oup,odown,ori;
// rate  50% 37% 10% 3%  0%
//score  86  71  56  41  30
int main(){
    //get data
	freopen("firstget.txt","r",stdin);
	while(1){
		++n;
		cin>>a[n].id;
//		if(a[n].id!=a[n-1].id) cout<<a[n].id<<" *\n";//
		if(a[n].id==0) break;
		cin>>a[n].name;
		for(int i=0;i<=9;++i) cin>>a[n].origin[i],a[n].last[i]=a[n].origin[i];
	}
	--n;
	cout<<"n="<<n<<"\n";
    //for each subject
	for(t=5;t<=9;++t){
		if(t==7) continue;
        //sort by score
		sort(a+1,a+n+1,[](Stu a,Stu b){return a.origin[t]>b.origin[t];});
		//count valid students
        nt=1;
		for(int i=1;i<=n;++i,++nt) if(a[i].origin[t]<=0) break;
		--nt;
        //find O_down
		for(int i=1;i<=5;++i){
			cut[i]=round((double)nt*rate[i]);
//			if(t==5) cout<<cut[i]<<" "<<a[cut[i]].origin[t]<<" *\n";//
			p=1;
			while(a[cut[i]].origin[t]==a[cut[i]+p].origin[t]&&
				a[cut[i]].origin[t]==a[cut[i]-p].origin[t]) ++p;//same score forward/backward
			//question:at the middle
//			if(t==5) cout<<cut[i]+p<<" "<<a[cut[i]+p].origin[3]<<" "<<cut[i]-p<<" "<<a[cut[i]-p].origin[3]<<"\n";//
			if(a[cut[i]].origin[t]!=a[cut[i]+p].origin[t]) cut[i]+=p-1;
			else cut[i]-=p-1;
		}
        //formula
		for(int i=1;i<=5;++i){
			fup=fs[i],fdown=fx[i],oup=a[cut[i-1]+1].origin[t],odown=a[cut[i]].origin[t];
			for(int j=cut[i-1]+1;j<=cut[i];++j){
				ori=a[j].origin[t];
				a[j].last[t]=round((fup*(ori-odown)+fdown*(oup-ori))/(oup-odown));
			}
		}
	}
    //calulate final total score
	for(int i=1;i<=n;++i){
		a[i].last[0]=0;
		for(int j=1;j<=9;++j){
			if(j!=5&&j!=6&&j!=8&&j!=9) a[i].last[j]=a[i].origin[j];
			if(a[i].last[j]>=0) a[i].last[0]+=a[i].last[j];//plus no -1
		}
	}
	//wen/li divide
	sort(a+1,a+n+1,[](Stu a,Stu b){return a.origin[4]>b.origin[4];});
	for(int i=1;i<=n;++i){
		if(a[i].origin[4]<=0) break;
		nli=i;
		li[i]=a[i]; 
	}
	sort(a+1,a+n+1,[](Stu a,Stu b){return a.origin[7]>b.origin[7];});
	for(int i=1;i<=n;++i){
		if(a[i].origin[7]<=0) break;
		nwen=i;
		wen[i]=a[i]; 
	}
    //print result
	freopen("result_li.txt","w",stdout);
	sort(li+1,li+nli+1,[](Stu a,Stu b){return a.last[0]>b.last[0];});
	cout<<"班级\t姓名\t总分\t语文\t数学\t英语\t物理\t化学原始分\t化学赋分\t生物原始分\t生物赋分\t地理原始分\t地理赋分\t政治原始分\t政治赋分\t\n";
	for(int i=1;i<=nli;++i){
		cout<<li[i].id<<"\t"<<li[i].name<<"\t";
		for(int j=0;j<=3;++j) cout<<li[i].last[j]<<"\t";
		cout<<li[i].last[4]<<"\t";
		for(int j=5;j<=9;++j) if(j!=7) cout<<li[i].origin[j]<<"\t"<<li[i].last[j]<<"\t";
		cout<<"\n";
	}
	freopen("result_wen.txt","w",stdout);
	sort(wen+1,wen+nwen+1,[](Stu a,Stu b){return a.last[0]>b.last[0];});
	cout<<"班级\t姓名\t总分\t语文\t数学\t英语\t历史\t化学原始分\t化学赋分\t生物原始分\t生物赋分\t地理原始分\t地理赋分\t政治原始分\t政治赋分\t\n";
	for(int i=1;i<=nwen;++i){
		cout<<wen[i].id<<"\t"<<wen[i].name<<"\t";
		for(int j=0;j<=3;++j) cout<<wen[i].last[j]<<"\t";
		cout<<wen[i].last[7]<<"\t";
		for(int j=5;j<=9;++j) if(j!=7) cout<<wen[i].origin[j]<<"\t"<<wen[i].last[j]<<"\t";
		cout<<"\n";
	}
	freopen("CON","w",stdout);
	cout<<"finished\nenter to exit";
	getch();
	return 0;
}
```

## 效果展示

![效果](./images/fufen/show.avif)

# 总结

## 收获

- 再也不用担心看不到赋分了
- 可以自行总分排序，排名误差精度达到基本±3，鲜有±5（年段未修正分数时）~~提前开别人的盒~~
- 使我对赋分过程非常熟悉
- 开创了赋分程序之先河，供后人借鉴

## 不足

- 与学校的赋分仍无法完全匹配，有误差
- 程序可能存在一些奇奇怪怪的BUG（尽管绝大多数时候它是对的）
- 想要这么做，需要先学会如何获取所有人的原始分，这个过程这里我们无法展开（尽管成绩可以通过询问他人实现，但这样就失去了“提前开盒”的~~乐趣~~意义）

# 拓展

尽管实现了自己动手（赋分）丰衣足食，半年后，我再次想简化得到赋分后总排名的途径，想把抓取成绩程序和赋分程序结合，然而它们语言不通：Python / C++

于是我再次研究怎么把C++赋分程序打包成一个Python库让我可以直接在Python里调用

于是去问了Deepseek

![询问](./images/fufen/tuo1.avif)

经历不少问题

![曲折](./images/fufen/tuo2.avif)

最后终于解决

![成果](./images/fufen/tuo3.avif)

打包成了一个.pyd文件，可以直接被其他程序调用。

至此，赋分的探索落下帷幕。

# 补充

不久后，我再次使用，发现这个.pyd文件出了点问题，没法直接调用了。于是我就回归了使用C++和Python的原始版本。