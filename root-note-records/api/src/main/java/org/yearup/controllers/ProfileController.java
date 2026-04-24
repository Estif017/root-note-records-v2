package org.yearup.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.yearup.data.ProfileDao;
import org.yearup.data.UserDao;
import org.yearup.models.Profile;
import org.yearup.models.User;

import java.security.Principal;

@RestController
@RequestMapping("profile")
@CrossOrigin
@PreAuthorize("isAuthenticated()")
public class ProfileController {
    private final ProfileDao profileDao;
    private final UserDao userDao;

    public ProfileController(ProfileDao profileDao, UserDao userDao) {
        this.profileDao = profileDao;
        this.userDao = userDao;
    }

    @GetMapping
    public Profile getProfile(Principal principal){
        String username = principal.getName();
        User user = userDao.getByUserName(username);
        Profile profile = profileDao.getByUserId(user.getId());
        if (profile == null)
        {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found for current user");
        }
        return profile;
    }

    @PutMapping
    public Profile updateProfile(@RequestBody Profile profile, Principal principal){
        String username = principal.getName();
        User user = userDao.getByUserName(username);

        Profile existingProfile = profileDao.getByUserId(user.getId());
        if (existingProfile == null)
        {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found for current user");
        }
        profile.setUserId(user.getId());
        return profileDao.update(profile);
    }
}
