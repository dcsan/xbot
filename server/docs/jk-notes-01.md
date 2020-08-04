Why are all these items/locations listed like this? As opposed to a general narrative description which includes key items that can be further investigated? @DC

To give people something to start with, lead them on a bit. if we're targeting ppl that have never played a text adventure before
we can remove them, or limit them, or detail them on a help
also put there for my debugging. something like the notebook should be explained, maybe in help is OK tho

>> removed buttons, just left 1 for first task

images ordering

- Handle, soap, robe, shoes (should be sandals) shouldn’t be listed and visible. They are discoverable upon looking at other items/locations (wardrobe, pillow,

yeah, i need to add a 'hidden' property/variable.

√ done
√ also removed entrance showing the items in the room

---
Are the buttons meant to be a quick nav to those items/descriptions?

right now they're linked to `x [item]`
there isn't really navigation as this is all in one 'room'

---
> Task1
so eg if user types `task1` (match)
it will set the room & notes to that state.
currently I don't have any code to prevent other actions being completed in order, but could add that.
task1 etc are for debug only.

----

Search desk
Close drawer

can add these. at the moment i have synonyms for commands and objects separately.
      - name: desk
        called: drawer|desk|squat desk

√ added

---

look chair
sit desk

√ added

You shouldn’t be able to get the soap without discovering it by look pillow. Same for handle, robe, and sandals

√ they're hidden now, but not actually locked if people randomly type that in. I can look at that later.

> Without the first voice guiding the first task upon entering the room, the players won’t understand the conceit or guided tasks. The voice should be the first thing at the beginning of entering the room

so that's like 'task1' above?

√ Look closet
√ Just bathrobe no sandals


√ Close closet
X Close door
√ Close wardrobe

√ Look handle



Look light

√ Wash hands

> In which order do you want to wash? You must follow procedure!

---
how to handle lists of items?
If we aren’t using a general description of the room, I wouldn’t use the list here

√ removed item list on entry

poem:
Delete the boldface, brackets, and parentheses.., these were just to indicate the solution
√ just left a bit of bold on the names

√ The handle is "missing’



-------

√ Use handle with sink

√ turn handle


---

you try to use the handle on the sink

... but nothing happens.


√ Now you can turn the handle > "The sink is now useable." Would be better

---
>>
Just your face? That doesn't seem to follow our procedure

john knauss  5:31 PM
√ The voice crackles out, "Follow proper procedure, Jack. Michael has told you how."



√ remove commas
Wash hands, neck, ears, face



----------------------------------
still to do


Look under bed





john knauss  5:26 PM
Use handle

cbg2APP  5:26 PM
Use the handle where?

john knauss  5:27 PM
Sink

cbg2APP  5:27 PM
I don't understand Sink

Use soap with sink
