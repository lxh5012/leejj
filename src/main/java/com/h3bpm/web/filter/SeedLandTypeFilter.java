 package com.h3bpm.web.filter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.dom4j.Document;
import org.dom4j.io.SAXReader;
import org.springframework.core.type.ClassMetadata;
import org.springframework.core.type.classreading.MetadataReader;
import org.springframework.core.type.classreading.MetadataReaderFactory;
import org.springframework.core.type.filter.TypeFilter;
/**
 * @author 时鹏
 * @date   2019-10-23 
 * @description 自定义过滤器 
 */
public class SeedLandTypeFilter implements TypeFilter{

    @Override
    public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory)
        throws IOException {
        ClassMetadata classMetadata= metadataReader.getClassMetadata();
        String className=classMetadata.getClassName();
        List<String> filterList=new ArrayList<String>();
        //从filter读取需要排除的文件路径
        Document document=null;
        SAXReader saxReader = new SAXReader(); 
        
        if("OThinker.H3.Controller.Controllers.Organization.OrgUserController".equals(className)) {
            System.out.println("----------不扫描你了");
            return true;     
        }
        return false;
    }

}
