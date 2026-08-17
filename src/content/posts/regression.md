---
title: 拟合与回归-神经网络初体验
published: 2026-08-01
slug: regression
pinned: false
description: 初次接触人工智能模型
tags: [人工智能, Python, C++]
category: 技术
draft: false
image: ./images/regression/p6.avif

---

# 项目概述

- 前置准备
- 部分原理
- 问题实例
- Python实现步骤
- 结果
- 总结

# 前置准备

个人采用的是PyTorch，可以在[PyTorch官网](https://pytorch.org/get-started/locally/)选择对应配置，然后在你电脑的cmd运行给出的指令即可。

PyTorch是一个开源深度学习框架，主要用于 **计算机视觉、自然语言处理** 等人工智能领域。它以 **动态计算图和自动微分** 为核心特性，兼具灵活性与部署能力。

对于想用Python实现的人，PyTorch无疑是最佳选择。

值得一提的是，较大项目可能比较吃内存（建议16-32G）~~（小的也能跑就是了）~~，同时最好支持GPU加速。

对于此项目，个人觉得基本没怎么消耗算力。

# 部分原理

关于原理，肯定无法详细完全展开，这里仅谈谈个人觉得比较有意思的。

## 随机梯度下降（SGD）

SGD，一种形象的理解是，对于二变量，通过计算估测值和真实值的差距，得到一个函数，这个函数可以看成一片丘陵，而你要接近最低点，也就是误差最小的地方。

![借的图](./images/regression/p6.avif)

对于当前所站的位置，计算一下坡面是向哪个方向倾斜的，然后朝这个方向走一定的步子，如果误差变小了，就走过去。

当然，只是这么做可能会陷入局部最优解，就像一个不那么低的盆地。

因此需要提及下面的内容。

## SGD的优化

值得一提的是，一开始本来只是想学习并了解 SGD ，但是最后并没有直接用 SGD ，而是用了优化版的 Adam——可以理解为动量+步子优化。

动量优化就是保留原有行走方向的一个惯性，防止路线七拐八绕。

步子优化就是根据坡度调整迈大步还是迈小步。

## 全连接前馈神经网络（MLP）

MLP是最基础的 **全连接神经网络** ，只包含信号映射和激活函数两个部分。

形象地说，先有一个输入层，包括若干变量的输入，然后会经历一些隐藏层，然后再到输出层输出结果。

对于每个神经元，它会对传来的数据进行特定运算，然后套上激活函数，传信号给下一个神经元。

特定运算中的函数有待定的系数，根据输出的误差情况进行调整，以接近最优解。

~~激活函数类似于神经元的阈值机制，只有刺激强度超过一定阈值的信号才能被传下去。~~ （修改意见：uuk）

激活函数是一类让其实现“对非线性数据的拟合”的一种映射函数。

最常见的是模拟人类神经元的阈值传导模式，也就是接下来要说的ReLU。

当然，还有各种对它的优化和其他激活方式，这里我未展开更多探究，因此暂时略过。

## ReLU函数

这是常用的激活函数，表达式如下：

$$ \text{ReLU}(x) = \begin{cases} x, & x > 0 \\ 0, & x \leq 0 \end{cases} $$

图像如图所示：

![ReLU函数图像](./images/regression/p7.avif)

它的神奇之处在于，可以通过套这个东西来拟合非线性的关系，感性地理解，是因为较弱的信号被削掉了。

## 数据标准化

注意到，ReLU以 $0$ 为拐点，而数据千奇百怪。

想要套用这个函数，比起调整这个函数，调整每一组数据显得更为合理。

每组数据会统一化成均值为 $0$ 、方差为 $1$ 的一组数据。

记原始数据为 $a_i$ ，标准化后数据为 $b_i$ ，原数据均值为 $x$ ，标准差为 $s$ ，那么：

$$b_i=(a_i-x)/s$$

# 问题实例

为了更好地实操，这里模拟一种情境。

某座城市里，设房面积为 $x_1$ 平米，建成后过了 $x_2$ 年，距离市中心 $x_3$ 千米，房子总价为 $y$ 万元。（$60 \leq x_1 \leq 560,1 \leq x_2 \leq 30,1 \leq x_3 \leq 50$）

我们假设这些变量一定满足如下关系：

$$y=\frac{x_1}{tanh(x_3)} - \sqrt {x_2}$$

其中 $tanh(x)$ 函数是双曲正切函数。

当然，可能不太符合生活实际，甚至可能出现负数。

不过，我们现在就可以生成一些数据，对一个确定性关系进行拟合回归。

# Python实现步骤

## 0. 涉及的Python库
- numpy（处理数据）
- torch（构建模型）
- matplotlib（生成直观图）

## 1. 生成随机训练数据

使用C++的mt_19937随机数。代码如下：

```cpp
#include<bits/stdc++.h>
#include<random>
using namespace std;
int x[6],a[1005][6],n;
double calc(int t[6]){return t[1]/tanh(t[3])-sqrt(t[2]);}
bool valid(){
	for(int i=1;i<=n;++i) if(x==a[i]) return false;
	return true;
}
int main(){
	freopen("data.txt","w",stdout);
	random_device rd;
	mt19937 gen(rd());
	uniform_int_distribution<int> d1(60,560),d2(1,30),d3(1,50);
	while(n<1000){
		do{x[1]=d1(gen),x[2]=d2(gen),x[3]=d3(gen);}while(!valid());
		++n;
		for(int i=1;i<=3;++i) a[n][i]=x[i];
	}
	for(int i=1;i<=n;++i) cout<<a[i][1]<<" "<<a[i][2]<<" "<<a[i][3]<<" "<<calc(a[i])<<"\n";
	return 0;
}
```

然后我们得到data.txt。

## 2. 读取数据

## 3. 划分训练集和测试集

## 4. 转为张量并标准化

## 5. 创建神经网络模型

## 6. 训练+保存

## 7. 评估+可视化

上述过程代码如下：

```py
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import matplotlib.pyplot as plt

# -------------------- 1. 从 data.txt 读取数据 --------------------
# 读取：每行 x1 x2 x3 y，数据之间用空格或制表符分隔
data = np.loadtxt('data.txt')  # shape: (1000, 4)

X = data[:, :3]   # 前3列是特征 (1000, 3)
y = data[:, 3:4]  # 第4列是目标值 (1000, 1)

print(f"加载数据完成，总样本数: {X.shape[0]}")

# -------------------- 2. 划分训练集和测试集 (8:2) --------------------
n_total = X.shape[0]
n_train = int(0.8 * n_total)  # 800
n_test = n_total - n_train

X_train_np = X[:n_train]
y_train_np = y[:n_train]
X_test_np = X[n_train:]
y_test_np = y[n_train:]

# 转为 PyTorch Tensor
X_train = torch.tensor(X_train_np, dtype=torch.float32)
y_train = torch.tensor(y_train_np, dtype=torch.float32)
X_test = torch.tensor(X_test_np, dtype=torch.float32)
y_test = torch.tensor(y_test_np, dtype=torch.float32)

# -------------------- 3. 标准化（使用训练集的均值和标准差） --------------------
# dim-dimension保留维度，计算结果仍是二维张量，便于后续归一化
mean = X_train.mean(dim=0, keepdim=True)
std = X_train.std(dim=0, keepdim=True)
X_train = (X_train - mean) / std
X_test = (X_test - mean) / std

# -------------------- 4. 创建 DataLoader --------------------
train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)
test_loader = DataLoader(TensorDataset(X_test, y_test), batch_size=32, shuffle=False)

# -------------------- 5. 定义神经网络模型 --------------------
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(3, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 1)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)
        return x

model = Net()
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# -------------------- 6. 训练循环 --------------------
epochs = 200
train_losses = []
test_losses = []

for epoch in range(epochs):

    # 训练模式
    model.train()
    total_loss = 0
    for Xb, yb in train_loader:
        optimizer.zero_grad()
        pred = model(Xb)
        loss = criterion(pred, yb)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * Xb.size(0)
    train_loss = total_loss / len(train_loader.dataset)
    train_losses.append(train_loss)

    # 测试集评估
    model.eval()
    test_loss = 0
    with torch.no_grad():
        for Xb, yb in test_loader:
            pred = model(Xb)
            loss = criterion(pred, yb)
            test_loss += loss.item() * Xb.size(0)
    test_loss = test_loss / len(test_loader.dataset)
    test_losses.append(test_loss)

    if (epoch + 1) % 20 == 0:
        print(f"Epoch {epoch+1:3d} | Train Loss: {train_loss:.6f} | Test Loss: {test_loss:.6f}")

# -------------------- 7. 保存模型 --------------------
torch.save(model.state_dict(), 'house_price_model.pth')
print("模型已保存为 house_price_model.pth")

# 同时保存标准化参数，以便后续预测新数据时使用
np.save('mean.npy', mean.numpy())
np.save('std.npy', std.numpy())
print("标准化参数已保存为 mean.npy 和 std.npy")

# -------------------- 8. 评估和可视化 --------------------
model.eval()
with torch.no_grad():
    y_pred = model(X_test).numpy()
    y_true = y_test.numpy()

# 计算 R^2
ss_res = ((y_true - y_pred) ** 2).sum()
ss_tot = ((y_true - y_true.mean()) ** 2).sum()
r2 = 1 - ss_res / ss_tot
print(f"测试集 R^2 分数: {r2:.6f}")

# 绘制预测 vs 真实图
plt.figure(figsize=(8, 6))
plt.scatter(y_true, y_pred, alpha=0.6, edgecolors='k', linewidth=0.5)
plt.plot([y_true.min(), y_true.max()], [y_true.min(), y_true.max()], 'r--', linewidth=2)
plt.xlabel('True y (万元)')
plt.ylabel('Predicted y (万元)')
plt.title(f'Prediction vs True (R² = {r2:.4f})')
plt.grid(True, linestyle='--', alpha=0.5)
plt.show()

# 可选：绘制训练和测试损失曲线
plt.figure(figsize=(8, 4))
plt.plot(range(1, epochs+1), train_losses, label='Train Loss')
plt.plot(range(1, epochs+1), test_losses, label='Test Loss')
plt.xlabel('Epoch')
plt.ylabel('MSE Loss')
plt.legend()
plt.title('Loss during training')
plt.grid(True, linestyle='--', alpha=0.5)
plt.show()
```

值得一提的是， $R^2$ 是样本决定系数，介于 $0$ ~ $1$ 之间，越大拟合效果越好。

一开始，我没想起来，后来，死去的记忆开始攻击我。

![样本决定系数](./images/regression/p5.avif)

# 结果

![训练过程](./images/regression/p1.avif)

![拟合图](./images/regression/p2.avif)

![误差变化](./images/regression/p3.avif)

![预测比对](./images/regression/p4.avif)

# 总结

- 通过这次实操，我对人工智能领域有了初步了解

- 神经网络是个神奇的东西，简单的结构却能模拟复杂的数据，要感谢大脑生物学的馈赠

- 神经网络模型已经发展出很多种类，不妨也去了解一下其他模型