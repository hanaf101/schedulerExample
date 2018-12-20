package com.scheduler.sample.service;

import java.util.Arrays;
import java.util.HashSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.scheduler.sample.model.Role;
import com.scheduler.sample.model.User;
import com.scheduler.sample.repository.RoleRepository;
import com.scheduler.sample.repository.UserRepository;



@Service("userService")
public class UserService {

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }
    
    /**
     * Used for login, Querying user based on email
     * @param email
     * @return
     */

    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Creates the user , by default given admin role
     * @param user
     * @return
     */
    public User saveUser(User user) {
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
    	user.setPassword(user.getPassword());
        user.setActive(1);

        Role userRole = roleRepository.findByRole("ADMIN");
        user.setRoles(new HashSet<Role>(Arrays.asList(userRole)));
        return userRepository.save(user);
    }
    

}