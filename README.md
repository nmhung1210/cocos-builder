# cocos-builder

CocosCreator now is more popular and powerful for game development. 
For advance user, there is a painful is that lacking of support for Linux & Docker stack.

This CocosCreator builder is arming to be an alternative of CocosCreator that can be run on Linux and inside a docker image as well.

### Example to build cocos creator project by this docker image:

```
docker run -v /path/to/myproject:/project nmhung1210/cocos-creator:2.1.4 --build="platform=web-mobile"
```