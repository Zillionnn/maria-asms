package main

import(
	"fmt"
	"os"
	"regexp"
	"errors"
	"image"
	"strings"
	"image/jpeg"
	"image/png"
	"path/filepath"
	"github.com/nfnt/resize"
)

//compress a jpg or png format image, the new images will be named autoly
func CompressImg(source string, hight uint) error {
	var err error
	var file *os.File
	reg, _ := regexp.Compile(`^.*\.((png)|(jpg))$`)
	if !reg.MatchString(source) {
		err = errors.New("%s is not a .png or .jpg file")
		// // logs.Error(err)
		return err
	}
	if file, err = os.Open(source); err != nil {
		// // logs.Error(err)
		return err
	}
	defer file.Close()
	name := file.Name()
	var img image.Image
	switch {
	case strings.HasSuffix(name, ".png"):
		if img, err = png.Decode(file); err != nil {
			// logs.Error(err)
			return err
		}
	case strings.HasSuffix(name, ".jpg"):
		if img, err = jpeg.Decode(file); err != nil {
			// logs.Error(err)
			return err
		}
	default:
		err = fmt.Errorf("Images %s name not right!", name)
		// logs.Error(err)
		return err
	}
	resizeImg := resize.Resize(hight, 0, img, resize.Lanczos3)
	newName := newName(source, int(hight))
	if outFile, err := os.Create(newName); err != nil {
		// logs.Error(err)
		return err
	} else {
		defer outFile.Close()
		err = jpeg.Encode(outFile, resizeImg, nil)
		if err != nil {
			// logs.Error(err)
			return err
		}
	}
	// abspath, _ := filepath.Abs(newName)
	// logs.Info("New imgs successfully save at: %s", abspath)
	return nil
}

//create a file name for the iamges that after resize
func newName(name string, size int) string {
	dir, file := filepath.Split(name)
	return fmt.Sprintf("%s_%d%s", dir, size, file)
}

func main() {
	// 接受参数
	var str string
	var argsList []string
    for i := 1; i < len(os.Args); i++ {
		str = os.Args[i]
		argsList = append(argsList, str)
		
		
	}
	fmt.Println(argsList)
	fmt.Println(argsList[0])
	
	for i := 0; i < len(argsList); i += 1 {
		if err := CompressImg(argsList[i], uint(2000)); err != nil {
			fmt.Println(err)
		}
	}
}