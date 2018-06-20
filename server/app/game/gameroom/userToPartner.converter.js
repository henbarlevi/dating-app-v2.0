"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * convert DB user object to  iPartner Object (@see iPartner)
 */
class UserToPartnerAdapter {
    static convert(user) {
        return {
            id: user._id.toString(),
            first_name: user.first_name,
            last_name: user.last_name,
            age: this.convertBirthDayToAge(user.birth_day),
            gender: user.gender,
            location: user.location,
            photo_link: user.photo_link,
            profile_link: user.profile_link
        };
    }
    static convertBirthDayToAge(birth_day) {
        var delta = Date.now() - birth_day.getTime(); //delta in milisec
        return (delta / 31536000000).toFixed(2);
    }
}
exports.UserToPartnerAdapter = UserToPartnerAdapter;
