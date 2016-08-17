# 实现自己的生成器

1. 下载generator-generator(官方提供的一个简单的生成generator结构的生成器)
2. yo generator 来生成我们的生成器文件结构

```
1. generator 就是一个标准的nodejs module
2. 最外层的文件夹名称格式必须是： generator-yourName (注意：必须是这样)
3. 在package.json中， name字段必须以generator-为前缀，keywords字段必须包含 yeoman-generator
4. 文件结构有两种
├───package.json
├───app/
│   └───index.js
└───router/
  └───index.js

├───package.json
└───generators/
    ├───app/
    │   └───index.js
    └───router/
        └───index.js


```
