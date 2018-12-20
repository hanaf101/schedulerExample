package com.scheduler.sample.utils;

import org.apache.commons.codec.binary.Base64;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ServiceUtils {

	public static String getStringfromObject(Object object) {
		ObjectMapper mapper = new ObjectMapper();

		try {
			return mapper.writeValueAsString(object);
		} catch (JsonProcessingException e) {
		}

		return null;
	}
	public static String getBase64DecodeString(String encodedString) {
		byte[] byteArray = Base64.decodeBase64(encodedString.getBytes());
		String decodedString = new String(byteArray);
		return decodedString;
		
	}
	

}
