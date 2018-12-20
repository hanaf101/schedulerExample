package com.scheduler.sample.utils;

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
}
